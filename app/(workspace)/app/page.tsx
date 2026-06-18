import { DeploymentStatus, Plan, PurchaseStatus, SubscriptionStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { CommandCenter } from "@/components/app/command-center";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { countQuotaDeployments, getUserPlan } from "@/lib/subscription/limits";
import { getStorefrontAnalytics } from "@/lib/storefront/storefront";

export const metadata = {
  title: "Command center",
};

function buildDeploymentTrend(
  rows: { createdAt: Date }[],
  days = 7,
): { date: string; value: number }[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const buckets: { date: string; value: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const value = rows.filter((r) => r.createdAt.toISOString().slice(0, 10) === key).length;
    buckets.push({ date: key, value });
  }
  return buckets;
}

export default async function DeveloperOverviewPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "ADMIN") {
    redirect("/admin");
  }
  assertDeveloperPortalUser(session);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    deployments,
    deploymentStatusCounts,
    plan,
    usedSlots,
    earningsAgg,
    listingCount,
    recentDeployRows,
    storefront,
    storefrontRecord,
    sub,
  ] = await Promise.all([
    prisma.deployment.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.deployment.groupBy({
      by: ["status"],
      where: { userId: session.id },
      _count: { _all: true },
    }),
    getUserPlan(session.id),
    countQuotaDeployments(session.id),
    prisma.purchase.aggregate({
      where: {
        status: PurchaseStatus.ACTIVE,
        software: { developerId: session.id },
      },
      _sum: { amountCents: true },
    }),
    prisma.software.count({ where: { developerId: session.id } }),
    prisma.deployment.findMany({
      where: { userId: session.id, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    getStorefrontAnalytics(session.id),
    prisma.developerStorefront.findUnique({
      where: { userId: session.id },
      select: { verified: true },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.id },
      select: { plan: true, status: true },
    }),
  ]);

  const countByStatus = (status: DeploymentStatus) =>
    deploymentStatusCounts.find((row) => row.status === status)?._count._all ?? 0;

  const activeCount = countByStatus(DeploymentStatus.ACTIVE);
  const pendingCount = countByStatus(DeploymentStatus.PENDING);
  const failedCount = countByStatus(DeploymentStatus.FAILED);
  const totalDeploys = deploymentStatusCounts.reduce(
    (sum, row) => sum + row._count._all,
    0,
  );

  const proActive = sub?.status === SubscriptionStatus.ACTIVE && sub.plan === Plan.PRO;
  const freeLimit = plan === Plan.FREE && !proActive;
  const maxFree = 1;
  const atLimit = freeLimit && usedSlots >= maxFree;

  const earningsCents = earningsAgg._sum.amountCents ?? 0;
  const currency = "ETB";
  const displayName = session.name?.trim() || session.email;

  return (
    <CommandCenter
      userName={displayName}
      deployments={deployments}
      activeCount={activeCount}
      totalDeploys={totalDeploys}
      earningsCents={earningsCents}
      listingCount={listingCount}
      currency={currency}
      storefront={storefront}
      storefrontVerified={storefrontRecord?.verified ?? false}
      deploymentTrend={buildDeploymentTrend(recentDeployRows)}
      statusBreakdown={{
        active: activeCount,
        pending: pendingCount,
        failed: failedCount,
      }}
      planInfo={{
        proActive,
        usedSlots,
        maxFree,
        atLimit,
      }}
    />
  );
}
