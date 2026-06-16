import { prisma } from "@/lib/prisma";
import { normalizeHandle } from "@/lib/storefront/handles";

export type AdminStorefrontRow = {
  handle: string;
  name: string;
  email: string;
  tagline?: string;
  verified: boolean;
  featured: boolean;
  theme: string;
  showRevenuePublic: boolean;
  viewCount: number;
  productCount: number;
  followerCount: number;
  createdAt: string;
};

export async function listStorefrontsForAdmin(): Promise<AdminStorefrontRow[]> {
  const rows = await prisma.developerStorefront.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          _count: { select: { softwareDeveloped: true } },
        },
      },
      _count: { select: { followers: true } },
    },
    orderBy: [{ verified: "desc" }, { featured: "desc" }, { updatedAt: "desc" }],
  });

  return rows.map((row) => ({
    handle: row.handle,
    name: row.user.name,
    email: row.user.email,
    tagline: row.tagline ?? undefined,
    verified: row.verified,
    featured: row.featured,
    theme: row.theme,
    showRevenuePublic: row.showRevenuePublic,
    viewCount: row.viewCount,
    productCount: row.user._count.softwareDeveloped,
    followerCount: row._count.followers,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function updateStorefrontAdminFlags(
  rawHandle: string,
  input: { verified?: boolean; featured?: boolean },
): Promise<AdminStorefrontRow | null> {
  const handle = normalizeHandle(rawHandle);
  const existing = await prisma.developerStorefront.findUnique({
    where: { handle },
    select: { userId: true },
  });
  if (!existing) return null;

  const data: { verified?: boolean; verifiedAt?: Date | null; featured?: boolean } = {};
  if (typeof input.verified === "boolean") {
    data.verified = input.verified;
    data.verifiedAt = input.verified ? new Date() : null;
  }
  if (typeof input.featured === "boolean") {
    data.featured = input.featured;
  }

  await prisma.developerStorefront.update({
    where: { handle },
    data,
  });

  const rows = await listStorefrontsForAdmin();
  return rows.find((r) => r.handle === handle) ?? null;
}
