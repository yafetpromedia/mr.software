import {
  DeploymentStatus,
  PurchaseStatus,
  Role,
  UserStatus,
} from "@prisma/client";
import { AdminOverviewDashboard } from "@/components/admin/admin-overview-dashboard";
import { getPlatformAnalytics } from "@/lib/admin/platform-analytics";
import { prisma } from "@/lib/prisma";
import { countPendingTestimonials } from "@/lib/testimonials";

function usdCents(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n / 100);
}

export default async function AdminOverviewPage() {
  const [
    userCount,
    softwareCount,
    purchaseCount,
    developerCount,
    storefrontCount,
    verifiedStorefrontCount,
    failedDeployCount,
    activeDeployCount,
    pendingDeployCount,
    revenueCents,
    nonActiveUserCount,
    pendingPurchaseCount,
    pendingTestimonials,
    recentAudit,
    analytics,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.software.count(),
    prisma.purchase.count(),
    prisma.user.count({ where: { role: Role.DEVELOPER } }),
    prisma.developerStorefront.count(),
    prisma.developerStorefront.count({ where: { verified: true } }),
    prisma.deployment.count({ where: { status: DeploymentStatus.FAILED } }),
    prisma.deployment.count({ where: { status: DeploymentStatus.ACTIVE } }),
    prisma.deployment.count({ where: { status: DeploymentStatus.PENDING } }),
    prisma.purchase.aggregate({
      where: { status: PurchaseStatus.ACTIVE },
      _sum: { amountCents: true },
    }),
    prisma.user.count({
      where: { status: { not: UserStatus.ACTIVE } },
    }),
    prisma.purchase.count({ where: { status: PurchaseStatus.PENDING } }),
    countPendingTestimonials(),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { admin: { select: { name: true } } },
    }),
    getPlatformAnalytics(30),
  ]);

  const totalRevenueCents = revenueCents._sum.amountCents ?? 0;

  const stats = [
    { label: "Accounts", value: userCount, href: "/admin/users" },
    { label: "Developers", value: developerCount, href: "/admin/users", hint: "DEVELOPER role" },
    { label: "Catalog", value: softwareCount, href: "/admin/software" },
    {
      label: "Storefronts",
      value: storefrontCount,
      href: "/admin/storefronts",
      hint: verifiedStorefrontCount > 0 ? `${verifiedStorefrontCount} verified` : undefined,
    },
    {
      label: "All-time revenue",
      value: usdCents(totalRevenueCents),
      href: "/admin/payments",
      hint: `${purchaseCount} purchase${purchaseCount === 1 ? "" : "s"}`,
    },
  ] as const;

  const alerts: { text: string; href: string; kind: "warn" | "bad" }[] = [];
  if (failedDeployCount > 0) {
    alerts.push({
      text: `${failedDeployCount} failed deployment(s) need review`,
      href: "/admin/deployments",
      kind: "bad",
    });
  }
  if (nonActiveUserCount > 0) {
    alerts.push({
      text: `${nonActiveUserCount} account(s) not ACTIVE`,
      href: "/admin/users",
      kind: "warn",
    });
  }
  if (pendingPurchaseCount > 0) {
    alerts.push({
      text: `${pendingPurchaseCount} purchase(s) awaiting completion`,
      href: "/admin/payments",
      kind: "warn",
    });
  }
  if (pendingTestimonials > 0) {
    alerts.push({
      text: `${pendingTestimonials} testimonial(s) pending review`,
      href: "/admin/testimonials",
      kind: "warn",
    });
  }

  return (
    <AdminOverviewDashboard
      stats={[...stats]}
      alerts={alerts}
      recentActivity={recentAudit.map((row) => ({
        id: row.id,
        action: row.action,
        adminName: row.admin.name,
        createdAt: row.createdAt.toISOString(),
        targetType: row.targetType,
      }))}
      deploySummary={{
        active: activeDeployCount,
        failed: failedDeployCount,
        pending: pendingDeployCount,
      }}
      analytics={analytics}
    />
  );
}
