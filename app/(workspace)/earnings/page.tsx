import { PurchaseStatus } from "@prisma/client";
import { EarningsDashboard } from "@/components/app/earnings-dashboard";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Revenue" };

function buildRevenueTrend(
  purchases: Array<{ createdAt: Date; amountCents: number | null }>,
  days = 30,
) {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }

  for (const purchase of purchases) {
    const key = purchase.createdAt.toISOString().slice(0, 10);
    if (!map.has(key)) continue;
    map.set(key, (map.get(key) ?? 0) + (purchase.amountCents ?? 0));
  }

  return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
}

export default async function EarningsPage() {
  const session = await getSession();
  if (!session) return null;
  assertDeveloperPortalUser(session);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [rows, monthRows, total, listingCount] = await Promise.all([
    prisma.purchase.findMany({
      where: { software: { developerId: session.id }, status: PurchaseStatus.ACTIVE },
      include: { software: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchase.findMany({
      where: {
        software: { developerId: session.id },
        status: PurchaseStatus.ACTIVE,
        createdAt: { gte: monthStart },
      },
    }),
    prisma.purchase.aggregate({
      where: { software: { developerId: session.id }, status: PurchaseStatus.ACTIVE },
      _sum: { amountCents: true },
    }),
    prisma.software.count({ where: { developerId: session.id } }),
  ]);

  const bySoftware = new Map<string, { name: string; cents: number; saleCount: number }>();
  for (const purchase of rows) {
    if (!purchase.software) continue;
    const current = bySoftware.get(purchase.softwareId) ?? {
      name: purchase.software.name,
      cents: 0,
      saleCount: 0,
    };
    current.cents += purchase.amountCents ?? 0;
    current.saleCount += 1;
    bySoftware.set(purchase.softwareId, current);
  }

  const byProduct = Array.from(bySoftware.entries())
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => b.cents - a.cents);

  const monthCents = monthRows.reduce((sum, purchase) => sum + (purchase.amountCents ?? 0), 0);
  const totalCents = total._sum.amountCents ?? 0;
  const displayCurrency = (rows.find((row) => row.currency)?.currency ?? "ETB").toUpperCase();

  const recentSales = rows.slice(0, 8).map((purchase) => ({
    id: purchase.id,
    productName: purchase.software?.name ?? "Unknown product",
    amountCents: purchase.amountCents ?? 0,
    currency: (purchase.currency ?? displayCurrency).toUpperCase(),
    createdAt: purchase.createdAt.toISOString(),
  }));

  const revenueTrend = buildRevenueTrend(rows);

  return (
    <EarningsDashboard
      totalCents={totalCents}
      monthCents={monthCents}
      currency={displayCurrency}
      saleCount={rows.length}
      monthSaleCount={monthRows.length}
      listingCount={listingCount}
      byProduct={byProduct}
      recentSales={recentSales}
      revenueTrend={revenueTrend}
    />
  );
}
