"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AfricaGlobeCanvas } from "@/components/landing/africa-launch/africa-globe-canvas";
import { useHeroIntro } from "@/components/landing/africa-launch/use-hero-intro";
import { EthiopiaFlagIcon } from "@/components/icons/ethiopia-flag-icon";
import { LaunchMapLiveDock } from "@/components/launch-map/launch-map-live-dock";
import { LaunchMapProvider, useLaunchMap } from "@/components/launch-map/launch-map-provider";
import type { LaunchMapPayload } from "@/lib/launch-map/types";

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  initialLaunchMap: LaunchMapPayload;
};

function AfricaLaunchHeroInner() {
  const reduce = useReducedMotion();
  const intro = useHeroIntro(!!reduce);
  const { data } = useLaunchMap();

  return (
    <section className="africa-launch-hero relative isolate flex h-[calc(100dvh-3.5rem)] w-full flex-col overflow-hidden sm:h-[calc(100dvh-4rem)]">
      <div className="africa-hero-stars pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden />
      <div className="africa-hero-noise pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden />

      <motion.div
        className="africa-globe-scene-wrap pointer-events-auto absolute inset-0 z-[1]"
        initial={false}
        animate={
          intro.globeRevealed && intro.globeReady
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.92, y: 20 }
        }
        transition={{ duration: 1.05, ease: REVEAL_EASE }}
        style={{ visibility: intro.globeReady ? "visible" : "hidden" }}
      >
        {intro.globeRevealed ? (
          <div className="africa-globe-soft-shadow pointer-events-none absolute inset-0" aria-hidden />
        ) : null}
        <AfricaGlobeCanvas
          className="absolute inset-0 h-full w-full"
          reduceMotion={!!reduce}
          isLight={false}
          energyPulse={intro.energyPulse}
          introComplete={intro.globeRevealed}
          deploymentArcs={data.arcs}
          onReady={() => intro.setGlobeReady(true)}
        />

        {intro.globeRevealed ? (
          <>
            <div className="africa-globe-vignette pointer-events-none absolute inset-0" aria-hidden />
            {intro.energyPulse ? (
              <div className="africa-globe-pulse-ring pointer-events-none absolute inset-0" aria-hidden />
            ) : null}
          </>
        ) : null}
        <div
          className="africa-launch-hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28"
          aria-hidden
        />
      </motion.div>

      {!reduce ? (
        <motion.div
          className="africa-cinematic-veil pointer-events-none absolute inset-0 z-[4]"
          initial={{ opacity: 1 }}
          animate={{ opacity: intro.veilVisible ? 1 : 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
      ) : null}

      <div className="pointer-events-none relative z-20 flex h-full flex-col px-4 pt-[clamp(1.5rem,4.5vh,2.75rem)] text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={intro.copyVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: REVEAL_EASE }}
          className="pointer-events-none mx-auto max-w-3xl"
        >
          <p className="africa-hero-eyebrow mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em]">
            <EthiopiaFlagIcon className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-sm" />
            Africa → World
          </p>
          <h1 className="africa-launch-hero-title font-display text-[clamp(2.35rem,7vw,4.35rem)] font-bold leading-[1.02] tracking-[-0.045em]">
            Build. Launch.{" "}
            <span className="africa-hero-accent">Monetize.</span>
          </h1>
          <p className="africa-launch-hero-subtitle mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed sm:text-base">
            Software from Africa to the world — on Mr.Software.
          </p>
          <div className="pointer-events-auto mt-6 flex flex-col items-center justify-center gap-3 sm:mt-7 sm:flex-row">
            <Link href="/app/factory" className="africa-hero-cta-primary group">
              Start Startup Factory
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/explore/map" className="africa-hero-cta-secondary">
              Live global map
            </Link>
          </div>
        </motion.div>

        <div className="min-h-0 flex-1 pointer-events-none" aria-hidden />

        {intro.copyVisible ? <LaunchMapLiveDock /> : null}

        <motion.p
          className="africa-launch-hero-hint pointer-events-none mt-auto pb-4 text-xs sm:pb-5"
          initial={reduce ? false : { opacity: 0 }}
          animate={intro.copyVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: REVEAL_EASE }}
        >
          Drag the globe to explore
        </motion.p>
      </div>
    </section>
  );
}

export function AfricaLaunchHero({ initialLaunchMap }: Props) {
  return (
    <LaunchMapProvider initial={initialLaunchMap}>
      <AfricaLaunchHeroInner />
    </LaunchMapProvider>
  );
}
