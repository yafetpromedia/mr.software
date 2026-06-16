export type ProductPlatforms = {
  playStoreUrl?: string | null;
  appStoreUrl?: string | null;
};

export function hasMobileStores(platforms: ProductPlatforms): boolean {
  return Boolean(platforms.playStoreUrl?.trim() || platforms.appStoreUrl?.trim());
}

/** Human-readable channel list — web is always available on Mr.Software */
export function platformSummary(platforms: ProductPlatforms): string {
  const parts = ["Web"];
  if (platforms.playStoreUrl?.trim()) parts.push("Play Store");
  if (platforms.appStoreUrl?.trim()) parts.push("App Store");
  return parts.join(" · ");
}
