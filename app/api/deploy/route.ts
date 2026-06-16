import { DeploymentStatus, Plan, SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { MAX_ZIP_BYTES } from "@/lib/deploy/constants";
import { processDeploymentZip } from "@/lib/deploy/process-deployment";
import { slugifyProjectName } from "@/lib/deploy/slug";
import { prisma } from "@/lib/prisma";
import { assertCanCreateDeployment } from "@/lib/subscription/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userCanDeploy(session.role)) {
    return NextResponse.json(
      {
        error:
          "Developer role required. An admin must promote your account before you can deploy.",
      },
      { status: 403 },
    );
  }

  await prisma.subscription.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      plan: Plan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
    update: {},
  });

  const deployLimit = checkRateLimit(`deploy:${session.id}`, 20, 3_600_000);
  if (!deployLimit.ok) {
    return NextResponse.json(
      {
        error: "Too many deploy requests this hour. Try again later.",
      },
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
        {
          error:
            "Upgrade required to deploy more projects. Free plan includes one deployment.",
        },
        { status: 402 },
      );
    }
    throw e;
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const nameRaw = typeof form.get("name") === "string" ? form.get("name") : "";
  const name = String(nameRaw).trim();
  if (name.length < 1 || name.length > 120) {
    return NextResponse.json(
      { error: "name is required (1–120 characters)" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file is required (ZIP)" }, { status: 400 });
  }

  if (file.size > MAX_ZIP_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_ZIP_BYTES} bytes)` },
      { status: 400 },
    );
  }

  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".zip")) {
    return NextResponse.json({ error: "Only .zip archives are allowed" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());

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
    },
  });

  await processDeploymentZip({
    deploymentId: deployment.id,
    zipBuffer: buf,
    request,
  });

  const updated = await prisma.deployment.findUnique({
    where: { id: deployment.id },
  });

  return NextResponse.json(
    {
      deployment: updated,
    },
    { status: 201 },
  );
}
