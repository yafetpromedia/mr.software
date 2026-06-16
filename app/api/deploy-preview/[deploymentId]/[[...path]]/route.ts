import { NextResponse } from "next/server";
import { DeploymentStatus } from "@prisma/client";
import { readLocalDeployFile, readS3DeployFile, useS3Storage } from "@/lib/deploy/storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ deploymentId: string; path?: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { deploymentId, path: pathSegs } = await context.params;
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });

  if (!deployment || deployment.status !== DeploymentStatus.ACTIVE) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let rel = (pathSegs ?? []).join("/");
  if (!rel || rel.endsWith("/")) {
    rel = rel.replace(/\/?$/, "");
    rel = rel ? `${rel}/index.html` : "index.html";
  }

  const s3 = useS3Storage();
  const file = s3
    ? await readS3DeployFile(deployment, rel)
    : await readLocalDeployFile(deployment, rel);

  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", file.contentType);
  headers.set("Cache-Control", "public, max-age=3600");

  return new NextResponse(new Uint8Array(file.buffer), { status: 200, headers });
}
