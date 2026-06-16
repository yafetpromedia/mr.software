import type { Metadata } from "next";
import { MarketplaceClient } from "@/components/marketplace-client";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Discover software in your Mr.Software portal",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AppMarketplacePage({ searchParams }: Props) {
  const { q } = await searchParams;
  return (
    <div className="relative -mx-4 min-h-[60vh] border border-[var(--border)]/60 border-t-0 bg-[var(--background)] sm:-mx-6 sm:mx-0 sm:rounded-2xl sm:border sm:border-t">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-grid-pattern opacity-25 [mask-image:radial-gradient(ellipse_100%_80%_at_50%_0%,black_20%,transparent_70%)] sm:absolute sm:h-full sm:rounded-2xl"
        aria-hidden
      />
      <MarketplaceClient variant="portal" initialQuery={q} />
    </div>
  );
}
