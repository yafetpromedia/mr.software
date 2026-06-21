import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LandingMarketplaceSpotlightSection } from "@/components/landing/landing-marketplace-spotlight-section";
import { LandingSectionPlaceholder } from "@/components/landing/landing-section-placeholder";
import { FeaturedStorefrontsRow } from "@/components/storefront/featured-storefronts-row";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getApprovedTestimonials } from "@/lib/testimonials";
import { getPublicTeamSection } from "@/lib/team";

const LandingMetricsStrip = dynamic(
  () =>
    import("@/components/landing/landing-metrics-strip").then((m) => ({
      default: m.LandingMetricsStrip,
    })),
  { loading: () => <LandingSectionPlaceholder className="h-20" /> },
);

const LandingFeatures = dynamic(
  () =>
    import("@/components/landing/landing-features").then((m) => ({
      default: m.LandingFeatures,
    })),
  { loading: () => <LandingSectionPlaceholder className="h-96" /> },
);

const LandingBento = dynamic(
  () =>
    import("@/components/landing/landing-bento").then((m) => ({
      default: m.LandingBento,
    })),
  { loading: () => <LandingSectionPlaceholder className="h-[28rem]" /> },
);

const PartnersSection = dynamic(
  () =>
    import("@/components/landing/partners-section").then((m) => ({
      default: m.PartnersSection,
    })),
  { loading: () => <LandingSectionPlaceholder className="h-40" /> },
);

const TestimonialsSection = dynamic(
  () =>
    import("@/components/landing/testimonials-section").then((m) => ({
      default: m.TestimonialsSection,
    })),
  { loading: () => <LandingSectionPlaceholder className="h-96" /> },
);

const GlobalVision = dynamic(
  () =>
    import("@/components/landing/global-vision").then((m) => ({
      default: m.GlobalVision,
    })),
  { loading: () => <LandingSectionPlaceholder className="h-80" /> },
);

const LandingTeam = dynamic(
  () =>
    import("@/components/landing/landing-team").then((m) => ({
      default: m.LandingTeam,
    })),
  { loading: () => <LandingSectionPlaceholder className="h-96" /> },
);

const LandingCtaBand = dynamic(
  () =>
    import("@/components/landing/landing-cta-band").then((m) => ({
      default: m.LandingCtaBand,
    })),
  { loading: () => <LandingSectionPlaceholder className="h-56" /> },
);

export async function LandingBelowFold() {
  const [{ partners }, testimonials, team] = await Promise.all([
    getPublicSiteSettings(),
    getApprovedTestimonials(),
    getPublicTeamSection(),
  ]);

  return (
    <>
      <LandingMetricsStrip />
      <Suspense fallback={<LandingSectionPlaceholder className="h-[32rem]" />}>
        <LandingMarketplaceSpotlightSection />
      </Suspense>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Suspense fallback={<LandingSectionPlaceholder className="h-48" />}>
          <FeaturedStorefrontsRow title="Featured creator stores" />
        </Suspense>
      </div>
      <LandingFeatures />
      <LandingBento />
      <PartnersSection partners={partners} />
      <TestimonialsSection testimonials={testimonials} />
      <GlobalVision />
      <LandingTeam settings={team.settings} members={team.members} />
      <LandingCtaBand />
    </>
  );
}
