import { LandingHeroSection } from "@/components/landing/landing-hero-section";
import { LandingMetricsStrip } from "@/components/landing/landing-metrics-strip";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingMarketplaceSpotlightSection } from "@/components/landing/landing-marketplace-spotlight-section";
import { LandingBento } from "@/components/landing/landing-bento";
import { PartnersSection } from "@/components/landing/partners-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { GlobalVision } from "@/components/landing/global-vision";
import { FeaturedStorefrontsRow } from "@/components/storefront/featured-storefronts-row";
import { LandingTeam } from "@/components/landing/landing-team";
import { LandingCtaBand } from "@/components/landing/landing-cta-band";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getApprovedTestimonials } from "@/lib/testimonials";

export default async function Home() {
  const [{ partners }, testimonials] = await Promise.all([
    getPublicSiteSettings(),
    getApprovedTestimonials(),
  ]);

  return (
    <div className="flex-1 overflow-x-hidden">
      <LandingHeroSection />
      <LandingMetricsStrip />
      <LandingMarketplaceSpotlightSection />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FeaturedStorefrontsRow title="Featured creator stores" />
      </div>
      <LandingFeatures />
      <LandingBento />
      <PartnersSection partners={partners} />
      <TestimonialsSection testimonials={testimonials} />
      <GlobalVision />
      <LandingTeam />
      <LandingCtaBand />
    </div>
  );
}
