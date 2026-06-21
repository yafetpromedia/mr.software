import { NextResponse } from "next/server";
import { oauthPublicOrigin } from "@/lib/auth/oauth-public-origin";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DOWNLOAD_TOKEN_TTL_SEC } from "@/lib/monetization/constants";
import { allowsFileDownload } from "@/lib/monetization/distribution-access";
import { signDownloadToken } from "@/lib/monetization/download-token";
import { userHasDownloadEntitlement } from "@/lib/monetization/entitlement";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: softwareId } = await context.params;

  const software = await prisma.software.findUnique({
    where: { id: softwareId },
  });

  if (!software) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!allowsFileDownload(software.distributionType)) {
    return NextResponse.json(
      { error: "This product is cloud-hosted only. Open your instance from My software." },
      { status: 403 },
    );
  }

  const entitled = await userHasDownloadEntitlement({
    user: { id: session.id, status: session.status },
    software,
  });

  if (!entitled) {
    return NextResponse.json(
      { error: "You do not have a license for this product" },
      { status: 403 },
    );
  }

  const token = signDownloadToken({
    userId: session.id,
    softwareId: software.id,
  });

  const origin = oauthPublicOrigin(request);
  const downloadUrl = `${origin}/api/downloads/${software.id}?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ downloadUrl, expiresInSec: DOWNLOAD_TOKEN_TTL_SEC });
}
