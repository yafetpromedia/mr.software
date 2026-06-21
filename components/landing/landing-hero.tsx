"use client";

import type { HeroFeaturedStore } from "@/components/landing/landing-hero-live-stack";
import { AfricaLaunchHero } from "@/components/landing/africa-launch/africa-launch-hero";
import type { LaunchMapPayload } from "@/lib/launch-map/types";

type Props = {
  featuredStore: HeroFeaturedStore;
  initialLaunchMap: LaunchMapPayload;
};

/** Interactive “Africa → World” storytelling hero with 3D globe. */
export function LandingHero({ featuredStore, initialLaunchMap }: Props) {
  void featuredStore;
  return <AfricaLaunchHero initialLaunchMap={initialLaunchMap} />;
}
