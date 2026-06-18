import type { DeveloperStorefront, Software, StorefrontTheme, User } from "@prisma/client";
import { notifyNewStorefrontFollower } from "@/lib/notifications/events";
import { prisma } from "@/lib/prisma";
import { mapSoftwareToItem } from "@/lib/data/software";
import type { SoftwareItem } from "@/lib/software-item";
import { normalizeHandle, validateHandle } from "@/lib/storefront/handles";
import { getDeveloperRevenueSummary } from "@/lib/storefront/revenue";
import { sumProductViewsForDeveloper, sumProductViewsByDeveloper } from "@/lib/software/product-views";

export type PublicStorefront = {
  handle: string;
  name: string;
  tagline?: string;
  bio?: string;
  website?: string;
  theme: StorefrontTheme;
  verified: boolean;
  featured: boolean;
  productCount: number;
  followerCount: number;
  isFollowing?: boolean;
  publicRevenueCents?: number;
  revenueCurrency?: string;
  products: SoftwareItem[];
};

export type OwnStorefront = {
  handle: string;
  tagline: string;
  bio: string;
  website: string;
  theme: StorefrontTheme;
  verified: boolean;
  showRevenuePublic: boolean;
  featured: boolean;
  publicUrl: string;
};

export type StorefrontAnalytics = {
  handle: string;
  totalProductViews: number;
  followerCount: number;
  productCount: number;
  totalRevenueCents: number;
  revenueCurrency: string;
  showRevenuePublic: boolean;
  recentFollowers: Array<{ name: string; followedAt: string }>;
};

function normalizeWebsite(website?: string | null): string | undefined {
  const value = website?.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

async function toPublicStorefront(
  storefront: DeveloperStorefront & {
    user: User;
    _count?: { followers: number };
  },
  products: Array<Software & { developer: User & { storefront?: DeveloperStorefront | null } }>,
  options?: { isFollowing?: boolean },
): Promise<PublicStorefront> {
  let publicRevenueCents: number | undefined;
  let revenueCurrency: string | undefined;
  if (storefront.showRevenuePublic) {
    const revenue = await getDeveloperRevenueSummary(storefront.userId);
    publicRevenueCents = revenue.totalCents;
    revenueCurrency = revenue.currency;
  }

  return {
    handle: storefront.handle,
    name: storefront.user.name,
    tagline: storefront.tagline ?? undefined,
    bio: storefront.bio ?? undefined,
    website: normalizeWebsite(storefront.website),
    theme: storefront.theme,
    verified: storefront.verified,
    featured: storefront.featured,
    productCount: products.length,
    followerCount: storefront._count?.followers ?? 0,
    isFollowing: options?.isFollowing,
    publicRevenueCents,
    revenueCurrency,
    products: products.map((row) => mapSoftwareToItem(row)),
  };
}

export async function getStorefrontByHandle(
  rawHandle: string,
  viewerUserId?: string,
): Promise<PublicStorefront | null> {
  const handle = normalizeHandle(rawHandle);
  const storefront = await prisma.developerStorefront.findUnique({
    where: { handle },
    include: {
      user: true,
      _count: { select: { followers: true } },
    },
  });
  if (!storefront) return null;

  const products = await prisma.software.findMany({
    where: { developerId: storefront.userId },
    orderBy: { createdAt: "desc" },
    include: { developer: { include: { storefront: true } } },
  });

  let isFollowing = false;
  if (viewerUserId) {
    const follow = await prisma.storefrontFollower.findUnique({
      where: {
        storefrontUserId_followerUserId: {
          storefrontUserId: storefront.userId,
          followerUserId: viewerUserId,
        },
      },
    });
    isFollowing = Boolean(follow);
  }

  return await toPublicStorefront(storefront, products, { isFollowing });
}

export async function getOwnStorefront(userId: string): Promise<OwnStorefront | null> {
  const storefront = await prisma.developerStorefront.findUnique({
    where: { userId },
  });
  if (!storefront) return null;
  return {
    handle: storefront.handle,
    tagline: storefront.tagline ?? "",
    bio: storefront.bio ?? "",
    website: storefront.website ?? "",
    theme: storefront.theme,
    verified: storefront.verified,
    showRevenuePublic: storefront.showRevenuePublic,
    featured: storefront.featured,
    publicUrl: `/@${storefront.handle}`,
  };
}

export async function isHandleAvailable(
  handle: string,
  excludeUserId?: string,
): Promise<boolean> {
  const error = validateHandle(handle);
  if (error) return false;
  const normalized = normalizeHandle(handle);
  const existing = await prisma.developerStorefront.findUnique({
    where: { handle: normalized },
    select: { userId: true },
  });
  if (!existing) return true;
  return Boolean(excludeUserId && existing.userId === excludeUserId);
}

export async function upsertStorefront(
  userId: string,
  input: {
    handle: string;
    tagline?: string;
    bio?: string;
    website?: string;
    theme?: StorefrontTheme;
    showRevenuePublic?: boolean;
  },
): Promise<OwnStorefront> {
  const handleError = validateHandle(input.handle);
  if (handleError) throw new Error(handleError);

  const handle = normalizeHandle(input.handle);
  const available = await isHandleAvailable(handle, userId);
  if (!available) throw new Error("This handle is already taken");

  const tagline = input.tagline?.trim() || null;
  const bio = input.bio?.trim() || null;
  const website = input.website?.trim() || null;

  const theme = input.theme ?? "CLASSIC";
  const showRevenuePublic = input.showRevenuePublic ?? false;

  const storefront = await prisma.developerStorefront.upsert({
    where: { userId },
    create: {
      userId,
      handle,
      tagline,
      bio,
      website,
      theme,
      showRevenuePublic,
    },
    update: {
      handle,
      tagline,
      bio,
      website,
      theme,
      showRevenuePublic,
    },
  });

  return {
    handle: storefront.handle,
    tagline: storefront.tagline ?? "",
    bio: storefront.bio ?? "",
    website: storefront.website ?? "",
    theme: storefront.theme,
    verified: storefront.verified,
    showRevenuePublic: storefront.showRevenuePublic,
    featured: storefront.featured,
    publicUrl: `/@${storefront.handle}`,
  };
}

export async function listFeaturedStorefronts(limit = 6): Promise<
  Array<{
    handle: string;
    name: string;
    tagline?: string;
    verified: boolean;
    productCount: number;
    followerCount: number;
    totalProductViews: number;
  }>
> {
  const rows = await prisma.developerStorefront.findMany({
    where: { featured: true },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          _count: { select: { softwareDeveloped: true } },
        },
      },
      _count: { select: { followers: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const viewsByDeveloper = await sumProductViewsByDeveloper();

  return rows.map((row) => ({
    handle: row.handle,
    name: row.user.name,
    tagline: row.tagline ?? undefined,
    verified: row.verified,
    productCount: row.user._count.softwareDeveloped,
    followerCount: row._count.followers,
    totalProductViews: viewsByDeveloper.get(row.user.id) ?? 0,
  }));
}

export async function getDeveloperHandle(userId: string): Promise<string | null> {
  const row = await prisma.developerStorefront.findUnique({
    where: { userId },
    select: { handle: true },
  });
  return row?.handle ?? null;
}

export async function followStorefront(
  rawHandle: string,
  followerUserId: string,
): Promise<{ followerCount: number }> {
  const handle = normalizeHandle(rawHandle);
  const storefront = await prisma.developerStorefront.findUnique({
    where: { handle },
    select: { userId: true, handle: true },
  });
  if (!storefront) throw new Error("Storefront not found");
  if (storefront.userId === followerUserId) {
    throw new Error("You cannot follow your own storefront");
  }

  const follower = await prisma.user.findUnique({
    where: { id: followerUserId },
    select: { name: true },
  });

  const wasFollowing = await prisma.storefrontFollower.findUnique({
    where: {
      storefrontUserId_followerUserId: {
        storefrontUserId: storefront.userId,
        followerUserId,
      },
    },
    select: { followerUserId: true },
  });

  await prisma.storefrontFollower.upsert({
    where: {
      storefrontUserId_followerUserId: {
        storefrontUserId: storefront.userId,
        followerUserId,
      },
    },
    create: { storefrontUserId: storefront.userId, followerUserId },
    update: {},
  });

  if (!wasFollowing) {
    await notifyNewStorefrontFollower({
      storefrontUserId: storefront.userId,
      followerName: follower?.name ?? "Someone",
      handle: storefront.handle,
    }).catch((e) => console.error("follower notification", e));
  }

  const count = await prisma.storefrontFollower.count({
    where: { storefrontUserId: storefront.userId },
  });
  return { followerCount: count };
}

export async function unfollowStorefront(
  rawHandle: string,
  followerUserId: string,
): Promise<{ followerCount: number }> {
  const handle = normalizeHandle(rawHandle);
  const storefront = await prisma.developerStorefront.findUnique({
    where: { handle },
    select: { userId: true },
  });
  if (!storefront) throw new Error("Storefront not found");

  await prisma.storefrontFollower.deleteMany({
    where: { storefrontUserId: storefront.userId, followerUserId },
  });

  const count = await prisma.storefrontFollower.count({
    where: { storefrontUserId: storefront.userId },
  });
  return { followerCount: count };
}

export async function getStorefrontAnalytics(
  userId: string,
): Promise<StorefrontAnalytics | null> {
  const storefront = await prisma.developerStorefront.findUnique({
    where: { userId },
    include: {
      user: { select: { _count: { select: { softwareDeveloped: true } } } },
      _count: { select: { followers: true } },
      followers: {
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { follower: { select: { name: true } } },
      },
    },
  });
  if (!storefront) return null;

  const [revenue, totalProductViews] = await Promise.all([
    getDeveloperRevenueSummary(userId),
    sumProductViewsForDeveloper(userId),
  ]);

  return {
    handle: storefront.handle,
    totalProductViews,
    followerCount: storefront._count.followers,
    productCount: storefront.user._count.softwareDeveloped,
    totalRevenueCents: revenue.totalCents,
    revenueCurrency: revenue.currency,
    showRevenuePublic: storefront.showRevenuePublic,
    recentFollowers: storefront.followers.map((f) => ({
      name: f.follower.name,
      followedAt: f.createdAt.toISOString(),
    })),
  };
}
