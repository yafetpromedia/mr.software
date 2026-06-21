import { LandingHero } from "@/components/landing/landing-hero";
import { listFeaturedStorefronts } from "@/lib/storefront/storefront";
import { getLaunchMapPayload } from "@/lib/launch-map/launch-map";

export async function LandingHeroSection() {
  const [stores, initialLaunchMap] = await Promise.all([
    listFeaturedStorefronts(1),
    getLaunchMapPayload(),
  ]);
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
      initialLaunchMap={initialLaunchMap}
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
