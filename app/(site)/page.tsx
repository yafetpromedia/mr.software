import { Suspense } from "react";
import { LandingBelowFold } from "@/components/landing/landing-below-fold";
import { LandingHeroSection } from "@/components/landing/landing-hero-section";
import { LandingSectionPlaceholder } from "@/components/landing/landing-section-placeholder";

export default function Home() {
  return (
    <div className="flex-1 overflow-x-hidden">
      <LandingHeroSection />
      <Suspense fallback={<LandingSectionPlaceholder className="h-[120vh]" />}>
        <LandingBelowFold />
      </Suspense>
    </div>
  );
}
