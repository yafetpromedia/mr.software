import { LandingHero } from "@/components/landing/landing-hero";
import { listFeaturedStorefronts } from "@/lib/storefront/storefront";

export async function LandingHeroSection() {
  const stores = await listFeaturedStorefronts(1);
  const featured = stores[0] ?? {
    handle: "devstudio",
    name: "Dev Studio",
    verified: true,
    productCount: 3,
    tagline: undefined,
    followerCount: 0,
    totalProductViews: 0,
  };

  return (
    <LandingHero
      featuredStore={{
        handle: featured.handle,
        name: featured.name,
        tagline: featured.tagline,
        verified: featured.verified,
        productCount: featured.productCount,
        followerCount: featured.followerCount,
        totalProductViews: featured.totalProductViews ?? 0,
      }}
    />
  );
}
