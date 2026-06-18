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
  /** Google Play listing URL when the product ships on Android */
  playStoreUrl?: string | null;
  /** Apple App Store listing URL when the product ships on iOS */
  appStoreUrl?: string | null;
  /** Only on detail fetches — checkout wiring */
  stripePriceId?: string | null;
  /** Product detail page views */
  viewCount?: number;
};
