"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AfricaGlobeCanvas } from "@/components/landing/africa-launch/africa-globe-canvas";
import { useCinematicStory } from "@/components/landing/africa-launch/use-cinematic-story";

export function AfricaLaunchHero() {
  const reduce = useReducedMotion();
  const story = useCinematicStory(!!reduce);

  return (
    <section className="relative isolate flex h-[calc(100dvh-3.5rem)] w-full flex-col overflow-x-clip bg-[#020204] sm:h-[calc(100dvh-4rem)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_130%_65%_at_50%_100%,rgba(255,122,26,0.16),transparent_68%)]" />

      {/* Globe — flush to hero top; pole clearance handled in 3D */}
      <div className="pointer-events-auto absolute inset-0 z-[1]">
        <AfricaGlobeCanvas
          className="absolute inset-0 h-full w-full"
          activeArcCount={story.activeArcs}
          litCountries={story.litCountries}
          reduceMotion={!!reduce}
          travel={null}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020204] via-[#020204]/70 to-transparent sm:h-28"
          aria-hidden
        />
      </div>

      {/* Copy — padded below nav */}
      <div className="pointer-events-none relative z-20 flex h-full flex-col px-4 pt-[clamp(1.5rem,4.5vh,2.75rem)] text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="font-display text-[clamp(2.25rem,7vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)]">
            Build. Launch.{" "}
            <span className="text-[#FF7A1A]">Monetize.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/55 sm:mt-4 sm:text-base">
            Software from Africa to the World — on Mr.Software.
          </p>
          <div className="pointer-events-auto mt-6 flex flex-col items-center justify-center gap-3 sm:mt-7 sm:flex-row">
            <Link href="/app/ai" className="africa-hero-cta-primary group">
              Join Platform
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/marketplace" className="africa-hero-cta-secondary">
              Explore Marketplace
            </Link>
          </div>
        </motion.div>

        <p className="pointer-events-none mt-auto pb-4 text-xs text-white/35 sm:pb-5">
          {story.icon} {story.text} · drag the globe to rotate
        </p>
      </div>
    </section>
  );
}
