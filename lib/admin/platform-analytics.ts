import {
  DeploymentStatus,
  PurchaseStatus,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sumAllProductViews } from "@/lib/software/product-views";

export type DailyPoint = { date: string; value: number };

export type TopProduct = {
  id: string;
  name: string;
  purchases: number;
  revenueCents: number;
};

export type RecentPurchase = {
  id: string;
  softwareName: string;
  buyerName: string;
  amountCents: number | null;
  status: string;
  createdAt: string;
};

export type PlatformAnalytics = {
  periodDays: number;
  revenueSeries: DailyPoint[];
  signupSeries: DailyPoint[];
  purchaseSeries: DailyPoint[];
  revenueCents: number;
  revenuePriorCents: number;
  signups: number;
  signupsPrior: number;
  purchases: number;
  purchasesPrior: number;
  roleBreakdown: { role: Role; count: number }[];
  deployBreakdown: { status: DeploymentStatus; count: number }[];
  topProducts: TopProduct[];
  recentPurchases: RecentPurchase[];
  totalProductViews: number;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDay(d: Date) {
  return startOfDay(d).toISOString().slice(0, 10);
}

function buildDayRange(days: number): string[] {
  const out: string[] = [];
  const end = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(isoDay(d));
  }
  return out;
}

function bucketByDay(
  rows: { createdAt: Date; amount?: number | null }[],
  days: number,
  sumField = false,
): DailyPoint[] {
  const range = buildDayRange(days);
  const map = new Map(range.map((d) => [d, 0]));
  for (const row of rows) {
    const key = isoDay(row.createdAt);
    if (!map.has(key)) continue;
    map.set(key, (map.get(key) ?? 0) + (sumField ? (row.amount ?? 0) : 1));
  }
  return range.map((date) => ({ date, value: map.get(date) ?? 0 }));
}

function periodBounds(days: number) {
  const end = new Date();
  const currentStart = new Date(end);
  currentStart.setDate(currentStart.getDate() - days);
  const priorStart = new Date(currentStart);
  priorStart.setDate(priorStart.getDate() - days);
  return { currentStart, priorStart, end };
}

export async function getPlatformAnalytics(days = 30): Promise<PlatformAnalytics> {
  const { currentStart, priorStart, end } = periodBounds(days);

  const [
    usersInRange,
    purchasesInRange,
    revenueAgg,
    revenuePriorAgg,
    signupsCurrent,
    signupsPrior,
    purchasesCurrent,
    purchasesPrior,
    roleGroups,
    deployGroups,
    topPurchaseGroups,
    recentPurchaseRows,
    productViews,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: priorStart } },
      select: { createdAt: true },
    }),
    prisma.purchase.findMany({
      where: {
        createdAt: { gte: priorStart },
        status: PurchaseStatus.ACTIVE,
      },
      select: { createdAt: true, amountCents: true },
    }),
    prisma.purchase.aggregate({
      where: {
        status: PurchaseStatus.ACTIVE,
        createdAt: { gte: currentStart, lte: end },
      },
      _sum: { amountCents: true },
    }),
    prisma.purchase.aggregate({
      where: {
        status: PurchaseStatus.ACTIVE,
        createdAt: { gte: priorStart, lt: currentStart },
      },
      _sum: { amountCents: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: currentStart, lte: end } } }),
    prisma.user.count({
      where: { createdAt: { gte: priorStart, lt: currentStart } },
    }),
    prisma.purchase.count({
      where: { createdAt: { gte: currentStart, lte: end }, status: PurchaseStatus.ACTIVE },
    }),
    prisma.purchase.count({
      where: {
        createdAt: { gte: priorStart, lt: currentStart },
        status: PurchaseStatus.ACTIVE,
      },
    }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.deployment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.purchase.groupBy({
      by: ["softwareId"],
      where: { status: PurchaseStatus.ACTIVE },
      _count: { _all: true },
      _sum: { amountCents: true },
      orderBy: { _count: { softwareId: "desc" } },
      take: 5,
    }),
    prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { name: true } },
        software: { select: { name: true } },
      },
    }),
    sumAllProductViews(),
  ]);

  const usersCurrent = usersInRange.filter((u) => u.createdAt >= currentStart);
  const purchasesCurrentRows = purchasesInRange.filter((p) => p.createdAt >= currentStart);

  const softwareIds = topPurchaseGroups.map((g) => g.softwareId);
  const softwareNames =
    softwareIds.length > 0
      ? await prisma.software.findMany({
          where: { id: { in: softwareIds } },
          select: { id: true, name: true },
        })
      : [];
  const nameById = new Map(softwareNames.map((s) => [s.id, s.name]));

  return {
    periodDays: days,
    revenueSeries: bucketByDay(
      purchasesCurrentRows.map((p) => ({ createdAt: p.createdAt, amount: p.amountCents })),
      days,
      true,
    ),
    signupSeries: bucketByDay(usersCurrent, days),
    purchaseSeries: bucketByDay(purchasesCurrentRows, days),
    revenueCents: revenueAgg._sum.amountCents ?? 0,
    revenuePriorCents: revenuePriorAgg._sum.amountCents ?? 0,
    signups: signupsCurrent,
    signupsPrior: signupsPrior,
    purchases: purchasesCurrent,
    purchasesPrior: purchasesPrior,
    roleBreakdown: roleGroups.map((g) => ({
      role: g.role,
      count: g._count._all,
    })),
    deployBreakdown: deployGroups.map((g) => ({
      status: g.status,
      count: g._count._all,
    })),
    topProducts: topPurchaseGroups.map((g) => ({
      id: g.softwareId,
      name: nameById.get(g.softwareId) ?? "Unknown",
      purchases: g._count._all,
      revenueCents: g._sum.amountCents ?? 0,
    })),
    recentPurchases: recentPurchaseRows.map((p) => ({
      id: p.id,
      softwareName: p.software.name,
      buyerName: p.user.name,
      amountCents: p.amountCents,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
    totalProductViews: productViews,
  };
}

export function pctChange(current: number, prior: number): number | null {
  if (prior === 0) return current > 0 ? 100 : null;
  return Math.round(((current - prior) / prior) * 100);
}
