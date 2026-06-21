import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertFetchableAssetUrl } from "@/lib/monetization/asset-fetch";
import { allowsFileDownload } from "@/lib/monetization/distribution-access";
import { userHasDownloadEntitlement } from "@/lib/monetization/entitlement";
import { verifyDownloadToken } from "@/lib/monetization/download-token";
import { getClientIp } from "@/lib/security/client-ip";
import { logSecurityEvent } from "@/lib/security/log";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ softwareId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`dl:${ip}`, 30, 60_000);
  if (!rl.ok) {
    logSecurityEvent("RATE_LIMITED", "download GET", { ip });
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
  }

  const { softwareId } = await context.params;
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  let payload: { userId: string; softwareId: string };
  try {
    payload = verifyDownloadToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  if (payload.softwareId !== softwareId) {
    return NextResponse.json({ error: "Token does not match software" }, { status: 400 });
  }

  const software = await prisma.software.findUnique({
    where: { id: softwareId },
  });

  if (!software) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!allowsFileDownload(software.distributionType)) {
    return NextResponse.json(
      { error: "This product is not available as a file download" },
      { status: 403 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, status: true },
  });

  const entitled = await userHasDownloadEntitlement({
    user,
    software,
  });

  if (!entitled) {
    return NextResponse.json(
      { error: "License no longer valid for this product" },
      { status: 403 },
    );
  }

  let assetUrl: URL;
  try {
    assetUrl = assertFetchableAssetUrl(software.assetUrl);
  } catch (e: unknown) {
    const code =
      e && typeof e === "object" && "code" in e
        ? (e as { code: string }).code
        : "";
    if (code === "SSRF_HOST_BLOCKED") {
      logSecurityEvent("SSRF_BLOCK", "download asset host blocked", {
        softwareId,
      });
    }
    console.error(e);
    return NextResponse.json({ error: "Asset configuration error" }, { status: 500 });
  }

  const upstream = await fetch(assetUrl.toString(), {
    redirect: "follow",
    headers: { Accept: "*/*" },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Could not fetch asset from origin" },
      { status: 502 },
    );
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");
  const safeName =
    `${software.name}`.replace(/[^\w\-. ]+/g, "_").trim().slice(0, 120) || "download";
  const disposition = `attachment; filename="${safeName}"`;

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", disposition);
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }
  headers.set("Cache-Control", "no-store");

  if (!upstream.body) {
    return NextResponse.json({ error: "Empty response" }, { status: 502 });
  }

  return new NextResponse(upstream.body, { status: 200, headers });
}
