"use client";

import type { HeroFeaturedStore } from "@/components/landing/landing-hero-live-stack";
import { AfricaLaunchHero } from "@/components/landing/africa-launch/africa-launch-hero";

type Props = {
  featuredStore: HeroFeaturedStore;
};

/** Interactive “Africa → World” storytelling hero with 3D globe. */
export function LandingHero({ featuredStore }: Props) {
  void featuredStore;
  return <AfricaLaunchHero />;
}
