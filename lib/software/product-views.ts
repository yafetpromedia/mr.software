import { prisma } from "@/lib/prisma";

/** Sum product page views for one developer (SQL — works across Prisma client reloads). */
export async function sumProductViewsForDeveloper(developerId: string): Promise<number> {
  const rows = await prisma.$queryRaw<[{ total: bigint | null }]>`
    SELECT COALESCE(SUM("viewCount"), 0)::bigint AS total
    FROM "Software"
    WHERE "developerId" = ${developerId}
  `;
  return Number(rows[0]?.total ?? 0);
}

/** Sum product page views platform-wide. */
export async function sumAllProductViews(): Promise<number> {
  const rows = await prisma.$queryRaw<[{ total: bigint | null }]>`
    SELECT COALESCE(SUM("viewCount"), 0)::bigint AS total
    FROM "Software"
  `;
  return Number(rows[0]?.total ?? 0);
}

/** Product view totals keyed by developer user id. */
export async function sumProductViewsByDeveloper(): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ developerId: string; total: bigint }[]>`
    SELECT "developerId", COALESCE(SUM("viewCount"), 0)::bigint AS total
    FROM "Software"
    GROUP BY "developerId"
  `;
  return new Map(rows.map((row) => [row.developerId, Number(row.total)]));
}
