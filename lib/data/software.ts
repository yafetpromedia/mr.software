import { PricingModel, type DeveloperStorefront, type Software, type SoftwareCategory, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { categoryLabel } from "@/lib/marketplace/categories";
import type { SoftwareItem } from "@/lib/software-item";
import { resolveThumbnailUrl } from "@/lib/software-thumbnails";

function firstLine(text: string, maxLen: number): string {
  const line = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? text;
  const trimmed = line.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

export function mapSoftwareToItem(
  row: Software & { developer: User & { storefront?: DeveloperStorefront | null } },
  options?: { includeStripe?: boolean },
): SoftwareItem {
  const priceType = row.pricingModel === PricingModel.FREE ? "free" : "paid";
  const base: SoftwareItem = {
    id: row.id,
    name: row.name,
    shortDescription: firstLine(row.description, 160),
    description: row.description,
    price: row.price,
    priceType,
    pricingModel: row.pricingModel,
    priceCents: row.priceCents,
    currency: row.currency,
    developerName: row.developer.name,
    developerHandle: row.developer.storefront?.handle,
    category: categoryLabel(row.category),
    categoryKey: row.category,
    thumbnailUrl: resolveThumbnailUrl(row.thumbnailUrl, row.id),
    playStoreUrl: row.playStoreUrl,
    appStoreUrl: row.appStoreUrl,
    viewCount: row.viewCount,
  };
  if (options?.includeStripe) {
    return { ...base, stripePriceId: row.stripePriceId };
  }
  return base;
}

export async function listSoftware(): Promise<SoftwareItem[]> {
  const rows = await prisma.software.findMany({
    orderBy: { createdAt: "desc" },
    include: { developer: { include: { storefront: true } } },
  });
  return rows.map((r) => mapSoftwareToItem(r));
}

export async function getSoftwareById(id: string): Promise<SoftwareItem | null> {
  const row = await prisma.software.findUnique({
    where: { id },
    include: { developer: { include: { storefront: true } } },
  });
  return row ? mapSoftwareToItem(row, { includeStripe: true }) : null;
}

export async function recordSoftwareView(
  softwareId: string,
  viewerUserId?: string,
): Promise<void> {
  const software = await prisma.software.findUnique({
    where: { id: softwareId },
    select: { developerId: true },
  });
  if (!software) return;
  if (viewerUserId && software.developerId === viewerUserId) return;

  await prisma.$executeRaw`
    UPDATE "Software" SET "viewCount" = "viewCount" + 1 WHERE id = ${softwareId}
  `;
}

/** Single query for detail page (entitlement checks need the full `Software` row). */
export async function getSoftwareDetailBundle(id: string): Promise<{
  item: SoftwareItem;
  software: Software & { developer: User & { storefront?: DeveloperStorefront | null } };
} | null> {
  const row = await prisma.software.findUnique({
    where: { id },
    include: { developer: { include: { storefront: true } } },
  });
  if (!row) return null;
  return {
    item: mapSoftwareToItem(row, { includeStripe: true }),
    software: row,
  };
}

export async function createSoftwareRecord(input: {
  name: string;
  description: string;
  price: string;
  pricingModel?: PricingModel;
  priceCents?: number;
  currency?: string;
  assetUrl: string;
  developerId: string;
  thumbnailUrl?: string | null;
  stripePriceId?: string | null;
  category?: SoftwareCategory;
  playStoreUrl?: string | null;
  appStoreUrl?: string | null;
}): Promise<SoftwareItem> {
  const row = await prisma.software.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      pricingModel: input.pricingModel ?? "ONE_TIME",
      priceCents: input.priceCents ?? 0,
      currency: input.currency?.trim() || "usd",
      assetUrl: input.assetUrl,
      developerId: input.developerId,
      category: input.category ?? "DEVELOPER_TOOLS",
      thumbnailUrl:
        typeof input.thumbnailUrl === "string" && input.thumbnailUrl.trim()
          ? input.thumbnailUrl.trim()
          : null,
      stripePriceId:
        typeof input.stripePriceId === "string" && input.stripePriceId.trim()
          ? input.stripePriceId.trim()
          : null,
      playStoreUrl:
        typeof input.playStoreUrl === "string" && input.playStoreUrl.trim()
          ? input.playStoreUrl.trim()
          : null,
      appStoreUrl:
        typeof input.appStoreUrl === "string" && input.appStoreUrl.trim()
          ? input.appStoreUrl.trim()
          : null,
    },
    include: { developer: { include: { storefront: true } } },
  });
  return mapSoftwareToItem(row);
}
