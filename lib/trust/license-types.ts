import type { OpenSourceLicense, ProductLicenseTier } from "@prisma/client";

export const PRODUCT_LICENSE_TIERS: ProductLicenseTier[] = [
  "PERSONAL",
  "COMMERCIAL",
  "ENTERPRISE",
  "OPEN_SOURCE",
];

export const OPEN_SOURCE_LICENSES: OpenSourceLicense[] = ["MIT", "APACHE_2", "GPL", "BSD"];

export const LICENSE_TIER_META: Record<
  ProductLicenseTier,
  { label: string; summary: string; hint: string }
> = {
  PERSONAL: {
    label: "Personal license",
    summary: "1 user · no redistribution",
    hint: "Individual or single-seat use. Buyers get a license key for verification.",
  },
  COMMERCIAL: {
    label: "Commercial license",
    summary: "Business use · unlimited employees",
    hint: "Organizations may deploy internally. Ideal for SaaS and B2B tools.",
  },
  ENTERPRISE: {
    label: "Enterprise license",
    summary: "Large orgs · custom support",
    hint: "Use for contact-sales or high-touch deals. Set price or describe terms in listing.",
  },
  OPEN_SOURCE: {
    label: "Open source",
    summary: "Public license template",
    hint: "Choose MIT, Apache 2.0, GPL, or BSD. Product can be free or paid for support.",
  },
};

export const OPEN_SOURCE_LABELS: Record<OpenSourceLicense, string> = {
  MIT: "MIT License",
  APACHE_2: "Apache License 2.0",
  GPL: "GNU GPL",
  BSD: "BSD License",
};

export function parseProductLicenseTier(value: unknown): ProductLicenseTier | undefined {
  if (typeof value !== "string") return undefined;
  return PRODUCT_LICENSE_TIERS.includes(value as ProductLicenseTier)
    ? (value as ProductLicenseTier)
    : undefined;
}

export function parseOpenSourceLicense(value: unknown): OpenSourceLicense | undefined {
  if (typeof value !== "string") return undefined;
  return OPEN_SOURCE_LICENSES.includes(value as OpenSourceLicense)
    ? (value as OpenSourceLicense)
    : undefined;
}

export function licenseTierLabel(tier: ProductLicenseTier): string {
  return LICENSE_TIER_META[tier].label;
}
