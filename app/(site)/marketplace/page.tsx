import { MarketplaceClient } from "@/components/marketplace-client";
import { FeaturedStorefrontsRow } from "@/components/storefront/featured-storefronts-row";

export const metadata = {
  title: "Catalog",
  description: "Browse software listings—public catalog surface on Mr.Software infrastructure.",
};

export default function MarketplacePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full overflow-x-hidden border-t border-stone-200 bg-[var(--background)] dark:border-[var(--border)]">
      <div
        className="bg-grid-pattern pointer-events-none fixed inset-0 -z-10 opacity-20 [mask-image:radial-gradient(ellipse_100%_80%_at_50%_-10%,black_20%,transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturedStorefrontsRow />
        <MarketplaceClient />
      </div>
    </div>
  );
}
