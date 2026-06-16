import { listSoftware } from "@/lib/data/software";
import { LandingMarketplaceSpotlight } from "@/components/landing/landing-marketplace-spotlight";

export async function LandingMarketplaceSpotlightSection() {
  const products = await listSoftware();

  return (
    <LandingMarketplaceSpotlight products={products} totalCount={products.length} />
  );
}
