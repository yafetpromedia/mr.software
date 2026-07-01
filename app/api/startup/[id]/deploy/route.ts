import { DeploymentStatus, Plan, SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { processDeploymentZip } from "@/lib/deploy/process-deployment";
import { jsonAfterDeploymentProcess } from "@/lib/deploy/deployment-response";
import { slugifyProjectName } from "@/lib/deploy/slug";
import { getGeneratedStartupById } from "@/lib/startup/db";
import { packageStartupStaticZip } from "@/lib/startup/package-static-zip";
import { prisma } from "@/lib/prisma";
import { assertCanCreateDeployment } from "@/lib/subscription/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 300;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!userCanDeploy(session.role)) {
    return NextResponse.json({ error: "Developer role required" }, { status: 403 });
  }

  const { id } = await context.params;
  const startup = await getGeneratedStartupById(id);
  if (!startup || startup.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.subscription.upsert({
    where: { userId: session.id },
    create: { userId: session.id, plan: Plan.FREE, status: SubscriptionStatus.ACTIVE },
    update: {},
  });

  const limit = checkRateLimit(`startup-deploy:${session.id}`, 10, 3_600_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many deploy requests this hour." }, { status: 429 });
  }

  try {
    await assertCanCreateDeployment(session.id);
  } catch (e) {
    if (
      e instanceof Error &&
      "code" in e &&
      (e as Error & { code: string }).code === "UPGRADE_REQUIRED"
    ) {
      return NextResponse.json({ error: "Upgrade required to deploy more projects." }, { status: 402 });
    }
    throw e;
  }

  const name = startup.payload.name.trim() || "AI Startup";
  let baseSlug = slugifyProjectName(name);
  let slug = baseSlug;
  let n = 0;
  while (
    await prisma.deployment.findUnique({
      where: { userId_slug: { userId: session.id, slug } },
    })
  ) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }

  const deployment = await prisma.deployment.create({
    data: {
      userId: session.id,
      name,
      slug,
      status: DeploymentStatus.PENDING,
      framework: "Static HTML",
    },
  });

  const zipBuffer = packageStartupStaticZip(startup.payload);

  await processDeploymentZip({
    deploymentId: deployment.id,
    zipBuffer,
    request,
  });

  const updated = await prisma.deployment.findUnique({ where: { id: deployment.id } });
  return jsonAfterDeploymentProcess(updated);
}
