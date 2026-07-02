import { DeploymentStatus, DistributionType, Plan, ProductKind, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPlanCapabilities, isPaidWorkspacePlan } from "@/lib/subscription/capabilities";

function upgradeError(code: string, message: string): Error {
  const err = new Error(message);
  (err as Error & { code: string }).code = code;
  return err;
}

/**
 * Counts deployments that consume the user's quota (in-flight or live).
 */
export async function countQuotaDeployments(userId: string): Promise<number> {
  return prisma.deployment.count({
    where: {
      userId,
      status: {
        in: [DeploymentStatus.PENDING, DeploymentStatus.ACTIVE],
      },
    },
  });
}

export async function countPublishedProducts(userId: string): Promise<number> {
  return prisma.software.count({
    where: {
      developerId: userId,
      published: true,
    },
  });
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, expiresAt: true },
  });
  if (!sub || sub.status !== SubscriptionStatus.ACTIVE) {
    return Plan.FREE;
  }
  if (sub.expiresAt && sub.expiresAt < new Date()) {
    return Plan.FREE;
  }
  return sub.plan;
}

export async function assertCanCreateDeployment(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  const caps = getPlanCapabilities(plan);
  if (caps.maxDeployments === "unlimited") return;

  const n = await countQuotaDeployments(userId);
  if (n >= caps.maxDeployments) {
    throw upgradeError(
      "UPGRADE_REQUIRED",
      `Free plan includes up to ${caps.maxDeployments} active projects. Upgrade to Pro for unlimited deployments.`,
    );
  }
}

export async function assertCanPublishProduct(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  const caps = getPlanCapabilities(plan);
  if (caps.maxPublishedProducts === "unlimited") return;

  const n = await countPublishedProducts(userId);
  if (n >= caps.maxPublishedProducts) {
    throw upgradeError(
      "LISTING_LIMIT",
      `Free plan includes up to ${caps.maxPublishedProducts} published products. Upgrade to Pro for unlimited listings.`,
    );
  }
}

export async function assertCanUploadDeployZip(userId: string): Promise<void> {
  const plan = await getUserPlan(userId);
  const caps = getPlanCapabilities(plan);
  if (!caps.zipUpload) {
    throw upgradeError(
      "ZIP_UPGRADE_REQUIRED",
      "ZIP uploads require a Pro or Studio plan. Upgrade to upload source-code archives.",
    );
  }
}

export async function assertCanSellSourceCode(input: {
  userId: string;
  distributionType: DistributionType;
  productKind?: ProductKind;
}): Promise<void> {
  const plan = await getUserPlan(input.userId);
  const caps = getPlanCapabilities(plan);
  const isSource =
    input.distributionType === DistributionType.SOURCE_CODE ||
    input.productKind === ProductKind.SOURCE_CODE;

  if (isSource && !caps.sourceCodeListing) {
    throw upgradeError(
      "SOURCE_UPGRADE_REQUIRED",
      "Source-code (.zip) listings require a Pro or Studio plan.",
    );
  }
}

export { isPaidWorkspacePlan };
