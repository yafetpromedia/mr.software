"use client";



import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";

import { LandingContainer } from "@/components/landing/landing-ui";

import { LandingHeroGlobe } from "@/components/landing/landing-hero-globe";

import type { HeroFeaturedStore } from "@/components/landing/landing-hero-live-stack";

import { ArrowRight } from "lucide-react";



type Props = {

  featuredStore: HeroFeaturedStore;

};



export function LandingHero({ featuredStore }: Props) {

  const reduce = useReducedMotion();

  void featuredStore;



  return (

    <section className="relative isolate flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-[#030303] sm:min-h-[calc(100dvh-4rem)]">

      <div

        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_100%,rgba(234,88,12,0.16),transparent_65%)]"

        aria-hidden

      />

      <div

        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"

        aria-hidden

      />



      {/* Copy — upper area, padded from nav */}

      <LandingContainer className="relative z-10 flex flex-1 flex-col justify-center pb-4 pt-24 sm:pt-28 lg:pt-32">

        <motion.div

          initial={reduce ? false : { opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}

          className="relative text-center"

        >

          <p className="mx-auto inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1 text-[11px] font-medium tracking-wide text-white/50 uppercase backdrop-blur-sm sm:text-xs">

            African software ecosystem

          </p>



          <h1 className="mx-auto mt-6 max-w-[13ch] text-balance font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.045em] text-white sm:mt-7 sm:text-[3.5rem] lg:text-[4.8rem]">

            Build. Launch.

            <br />

            <span className="bg-gradient-to-r from-orange-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">

              Monetize.

            </span>

          </h1>



          <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/45 sm:text-base">

            Design, build, deploy, and monetize software with AI-assisted workflows.

          </p>



          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link

              href="/app/ai"

              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-[#0a0a0a] shadow-[0_0_40px_rgba(255,255,255,0.08)] transition hover:bg-white/90 sm:h-12"

            >

              Join Platform

            </Link>

            <Link

              href="#"

              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-5 text-sm font-medium text-white/70 backdrop-blur-sm transition hover:border-white/20 hover:text-white sm:h-12"

            >

              Contact Sales

              <ArrowRight className="h-3.5 w-3.5" />

            </Link>

          </div>

        </motion.div>

      </LandingContainer>



      {/* Earth — dedicated bottom strip */}

      <div className="relative h-[min(40vh,360px)] w-full shrink-0 sm:h-[min(44vh,400px)] lg:h-[min(46vh,440px)]">

        <LandingHeroGlobe reduceMotion={!!reduce} />

      </div>

    </section>

  );

}

