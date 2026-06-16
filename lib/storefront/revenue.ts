import { prisma } from "@/lib/prisma";

export async function getDeveloperRevenueSummary(developerId: string): Promise<{
  totalCents: number;
  saleCount: number;
  currency: string;
}> {
  const agg = await prisma.purchase.aggregate({
    where: {
      status: "ACTIVE",
      software: { developerId },
    },
    _sum: { amountCents: true },
    _count: true,
  });

  const topCurrency = await prisma.purchase.findFirst({
    where: {
      status: "ACTIVE",
      software: { developerId },
      amountCents: { gt: 0 },
    },
    select: { currency: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    totalCents: agg._sum.amountCents ?? 0,
    saleCount: agg._count,
    currency: topCurrency?.currency ?? "usd",
  };
}
