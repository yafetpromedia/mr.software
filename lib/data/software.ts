import { PricingModel, type DeveloperStorefront, type Software, type SoftwareCategory, type User, type ProductLicenseTier, type OpenSourceLicense, type DistributionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { categoryLabel } from "@/lib/marketplace/categories";
import { parseStorefrontSocialLinks, type StorefrontSocialLinks } from "@/lib/storefront/social-links";
import type { SoftwareItem } from "@/lib/software-item";
import { resolveThumbnailUrl } from "@/lib/software-thumbnails";
import { applyTrustOnSoftwarePublish } from "@/lib/trust/publish-trust";
import { formatFingerprintShort } from "@/lib/trust/fingerprint";
import { licenseTierLabel, OPEN_SOURCE_LABELS } from "@/lib/trust/license-types";
import { distributionTypeLabel } from "@/lib/trust/distribution-types";

function firstLine(text: string, maxLen: number): string {
  const line = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? text;
  const trimmed = line.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

export function mapSoftwareToItem(
  row: Software & {
    developer: User & { storefront?: DeveloperStorefront | null };
    ownershipRecord?: { recordNumber: string } | null;
  },
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
    developerSocialLinks: parseStorefrontSocialLinks(row.developer.storefront?.socialLinksJson),
    category: categoryLabel(row.category),
    categoryKey: row.category,
    thumbnailUrl: resolveThumbnailUrl(row.thumbnailUrl, row.id),
    playStoreUrl: row.playStoreUrl,
    appStoreUrl: row.appStoreUrl,
    viewCount: row.viewCount,
    licenseTier: row.licenseTier,
    licenseTierLabel: licenseTierLabel(row.licenseTier),
    openSourceLicense: row.openSourceLicense
      ? OPEN_SOURCE_LABELS[row.openSourceLicense]
      : undefined,
    ownershipRecordNumber: row.ownershipRecord?.recordNumber,
    contentFingerprint: row.contentFingerprint
      ? formatFingerprintShort(row.contentFingerprint)
      : undefined,
    distributionType: row.distributionType,
    distributionTypeLabel: distributionTypeLabel(row.distributionType),
  };
  if (options?.includeStripe) {
    return { ...base, stripePriceId: row.stripePriceId };
  }
  return base;
}

export async function listSoftware(): Promise<SoftwareItem[]> {
  const rows = await prisma.software.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { developer: { include: { storefront: true } }, ownershipRecord: true },
  });
  return rows.map((r) => mapSoftwareToItem(r));
}

export async function getSoftwareById(id: string): Promise<SoftwareItem | null> {
  const row = await prisma.software.findUnique({
    where: { id },
    include: { developer: { include: { storefront: true } }, ownershipRecord: true },
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
    include: { developer: { include: { storefront: true } }, ownershipRecord: true },
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
  licenseTier?: ProductLicenseTier;
  openSourceLicense?: OpenSourceLicense | null;
  distributionType?: DistributionType;
}): Promise<SoftwareItem & { ownershipRecordNumber: string; contentFingerprint: string }> {
  const developer = await prisma.user.findUnique({
    where: { id: input.developerId },
    select: { name: true },
  });
  if (!developer) throw new Error("Developer not found");

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
      licenseTier: input.licenseTier ?? "PERSONAL",
      openSourceLicense: input.openSourceLicense ?? null,
      distributionType: input.distributionType ?? "COMPILED",
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
    include: { developer: { include: { storefront: true } }, ownershipRecord: true },
  });

  const trust = await applyTrustOnSoftwarePublish({
    softwareId: row.id,
    developerId: input.developerId,
    developerName: developer.name,
    name: input.name,
    description: input.description,
    assetUrl: input.assetUrl,
    licenseTier: input.licenseTier ?? "PERSONAL",
    openSourceLicense: input.openSourceLicense,
  });

  const refreshed = await prisma.software.findUniqueOrThrow({
    where: { id: row.id },
    include: { developer: { include: { storefront: true } }, ownershipRecord: true },
  });

  return {
    ...mapSoftwareToItem(refreshed),
    ownershipRecordNumber: trust.ownershipRecordNumber,
    contentFingerprint: trust.contentFingerprint,
  };
}

export async function updateSoftwareListing(
  softwareId: string,
  developerId: string,
  input: {
    name?: string;
    description?: string;
    category?: SoftwareCategory;
    pricingModel?: PricingModel;
    price?: string;
    priceCents?: number;
    currency?: string;
    thumbnailUrl?: string | null;
    playStoreUrl?: string | null;
    appStoreUrl?: string | null;
    published?: boolean;
  },
): Promise<SoftwareItem | null> {
  const existing = await prisma.software.findFirst({
    where: { id: softwareId, developerId },
  });
  if (!existing) return null;

  const row = await prisma.software.update({
    where: { id: softwareId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.pricingModel !== undefined ? { pricingModel: input.pricingModel } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.thumbnailUrl !== undefined ? { thumbnailUrl: input.thumbnailUrl } : {}),
      ...(input.playStoreUrl !== undefined ? { playStoreUrl: input.playStoreUrl } : {}),
      ...(input.appStoreUrl !== undefined ? { appStoreUrl: input.appStoreUrl } : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
    },
    include: { developer: { include: { storefront: true } }, ownershipRecord: true },
  });

  return mapSoftwareToItem(row, { includeStripe: true });
}

export async function deleteSoftwareListing(
  softwareId: string,
  developerId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const existing = await prisma.software.findFirst({
    where: { id: softwareId, developerId },
    select: { id: true },
  });
  if (!existing) return { ok: false, reason: "Listing not found" };

  const activeSales = await prisma.purchase.count({
    where: { softwareId, status: "ACTIVE" },
  });
  if (activeSales > 0) {
    return {
      ok: false,
      reason: "This product has active buyers. Hide it from the marketplace instead of deleting.",
    };
  }

  await prisma.software.delete({ where: { id: softwareId } });
  return { ok: true };
}
