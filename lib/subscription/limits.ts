import { DeploymentStatus, Plan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const FREE_DEPLOYMENT_MAX = 1;

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
  if (plan === Plan.PRO) {
    return;
  }
  const n = await countQuotaDeployments(userId);
  if (n >= FREE_DEPLOYMENT_MAX) {
    const err = new Error("UPGRADE_REQUIRED");
    (err as Error & { code: string }).code = "UPGRADE_REQUIRED";
    throw err;
  }
}
