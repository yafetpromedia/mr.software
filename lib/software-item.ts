import type { StorefrontSocialLinks } from "@/lib/storefront/social-links";

export type SoftwareDistributionType = "SOURCE_CODE" | "COMPILED" | "HOSTED";

export type SoftwareItem = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  priceType: "free" | "paid";
  pricingModel: "FREE" | "ONE_TIME" | "SUBSCRIPTION";
  priceCents: number;
  currency: string;
  developerName: string;
  category: string;
  categoryKey?: string;
  /** Resolved cover image (DB value or deterministic fallback) */
  thumbnailUrl: string;
  /** Public storefront handle when configured */
  developerHandle?: string;
  /** Social profile links from the developer storefront */
  developerSocialLinks?: StorefrontSocialLinks;
  /** Google Play listing URL when the product ships on Android */
  playStoreUrl?: string | null;
  /** Apple App Store listing URL when the product ships on iOS */
  appStoreUrl?: string | null;
  /** Product license tier (Personal, Commercial, Enterprise, Open source) */
  licenseTier?: string;
  licenseTierLabel?: string;
  /** Human-readable open-source license when tier is OPEN_SOURCE */
  openSourceLicense?: string;
  /** Mr.Software ownership record id (Level 1 trust) */
  ownershipRecordNumber?: string;
  /** Short SHA-256 fingerprint of published product metadata */
  contentFingerprint?: string;
  /** How buyers receive the product */
  distributionType?: SoftwareDistributionType;
  distributionTypeLabel?: string;
  /** Only on detail fetches — checkout wiring */
  stripePriceId?: string | null;
  /** Product detail page views */
  viewCount?: number;
};
