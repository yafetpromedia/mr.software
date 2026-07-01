import { DeploymentStatus, Plan, SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { MAX_ZIP_BYTES } from "@/lib/deploy/constants";
import { processDeploymentZip } from "@/lib/deploy/process-deployment";
import { jsonAfterDeploymentProcess } from "@/lib/deploy/deployment-response";
import { slugifyProjectName } from "@/lib/deploy/slug";
import { downloadGithubRepoArchive } from "@/lib/github/api";
import { getGithubAccessToken } from "@/lib/github/connection";
import { isGithubConfigured } from "@/lib/github/config";
import {
  createGithubRepoWebhook,
  getGithubWebhookSecret,
  githubWebhookCallbackUrl,
} from "@/lib/github/webhooks";
import { prisma } from "@/lib/prisma";
import { assertCanCreateDeployment } from "@/lib/subscription/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 300;

const bodySchema = z.object({
  owner: z.string().min(1).max(120),
  repo: z.string().min(1).max(120),
  branch: z.string().min(1).max(120).optional(),
  name: z.string().min(1).max(120).optional(),
  autoDeploy: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userCanDeploy(session.role)) {
    return NextResponse.json({ error: "Developer role required" }, { status: 403 });
  }

  if (!isGithubConfigured()) {
    return NextResponse.json({ error: "GitHub is not configured" }, { status: 503 });
  }

  const token = await getGithubAccessToken(session.id);
  if (!token) {
    return NextResponse.json({ error: "Connect GitHub first" }, { status: 400 });
  }

  await prisma.subscription.upsert({
    where: { userId: session.id },
    create: { userId: session.id, plan: Plan.FREE, status: SubscriptionStatus.ACTIVE },
    update: {},
  });

  const deployLimit = checkRateLimit(`github-deploy:${session.id}`, 10, 3_600_000);
  if (!deployLimit.ok) {
    return NextResponse.json(
      { error: "Too many deploy requests this hour." },
      { status: 429, headers: { "Retry-After": String(deployLimit.retryAfterSec) } },
    );
  }

  try {
    await assertCanCreateDeployment(session.id);
  } catch (e) {
    if (
      e instanceof Error &&
      "code" in e &&
      (e as Error & { code: string }).code === "UPGRADE_REQUIRED"
    ) {
      return NextResponse.json(
        { error: "Upgrade required to deploy more projects." },
        { status: 402 },
      );
    }
    throw e;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { owner, repo, branch = "main" } = parsed.data;
  const name = parsed.data.name?.trim() || repo;
  const autoDeploy = parsed.data.autoDeploy ?? true;
  const webhookSecret = getGithubWebhookSecret();

  let zipBuffer: Buffer;
  try {
    zipBuffer = await downloadGithubRepoArchive({
      accessToken: token,
      owner,
      repo,
      ref: branch,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not download repository archive from GitHub." },
      { status: 502 },
    );
  }

  if (zipBuffer.length > MAX_ZIP_BYTES) {
    return NextResponse.json(
      { error: `Repository archive exceeds ${MAX_ZIP_BYTES / (1024 * 1024)} MB limit.` },
      { status: 400 },
    );
  }

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
      githubOwner: owner,
      githubRepo: repo,
      githubBranch: branch,
      autoDeploy: autoDeploy && Boolean(webhookSecret),
    },
  });

  if (autoDeploy && webhookSecret) {
    try {
      const hookId = await createGithubRepoWebhook({
        accessToken: token,
        owner,
        repo,
        callbackUrl: githubWebhookCallbackUrl(deployment.id),
        secret: webhookSecret,
      });
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { githubWebhookId: hookId },
      });
    } catch (e) {
      console.error("GitHub webhook setup failed", e);
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { autoDeploy: false },
      });
    }
  }

  await processDeploymentZip({
    deploymentId: deployment.id,
    zipBuffer,
    request,
  });

  const updated = await prisma.deployment.findUnique({ where: { id: deployment.id } });

  return jsonAfterDeploymentProcess(updated);
}
