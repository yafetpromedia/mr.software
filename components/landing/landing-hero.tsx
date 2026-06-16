"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BrowserFrame, LandingContainer } from "@/components/landing/landing-ui";
import { LandingHeroEyebrow } from "@/components/landing/landing-hero-eyebrow";
import { LandingHeroPreview } from "@/components/landing/landing-hero-preview";
import {
  LandingHeroLiveStack,
  type HeroFeaturedStore,
} from "@/components/landing/landing-hero-live-stack";

type Props = {
  featuredStore: HeroFeaturedStore;
};

const TRUST_LINKS = [
  { label: "Storefronts", href: (h: string) => `/@${h}` },
  { label: "Marketplace", href: () => "/marketplace" },
  { label: "Academy", href: () => "/academy" },
] as const;

export function LandingHero({ featuredStore }: Props) {
  const reduce = useReducedMotion();

  return (
    <section className="landing-hero relative overflow-hidden">
      <div className="landing-hero-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-hero-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-hero-vignette pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="bg-noise pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-multiply dark:opacity-10"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -top-40 left-[20%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[var(--accent)]/8 blur-[120px]"
        animate={reduce ? undefined : { opacity: [0.3, 0.55, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute top-20 right-[5%] h-[320px] w-[320px] rounded-full bg-sky-500/6 blur-[100px]"
        animate={reduce ? undefined : { opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        aria-hidden
      />

      <LandingContainer className="relative max-w-7xl pt-12 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,17rem)] xl:gap-8">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <LandingHeroEyebrow />

            <h1 className="mt-7 max-w-[14ch] text-balance font-display text-[2.5rem] font-bold leading-[1.04] tracking-[-0.045em] sm:text-[3.25rem] xl:text-[3.75rem]">
              Build products.
              <span className="mt-1 block text-brand-gradient">Sell from your store.</span>
              <span className="mt-1 block text-[0.88em] font-bold tracking-[-0.04em] text-[var(--foreground)]">
                Own the stack.
              </span>
            </h1>

            <p className="mt-5 max-w-[34ch] text-[0.95rem] leading-[1.7] text-[var(--muted)] sm:text-base">
              {featuredStore.tagline ? (
                featuredStore.tagline
              ) : (
                <>
                  Draft with AI, list on the marketplace, and run a public store at{" "}
                  <code className="rounded-md border border-[var(--border)] bg-[var(--surface)]/80 px-1.5 py-0.5 font-mono text-[0.78em] text-[var(--foreground)]">
                    /@{featuredStore.handle}
                  </code>
                  . Deploy anywhere you want.
                </>
              )}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {TRUST_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href(featuredStore.handle)}
                  className="hero-trust-pill inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 px-3.5 py-1.5 text-[0.7rem] font-medium text-[var(--foreground)] backdrop-blur-md transition hover:border-[var(--accent)]/30"
                >
                  {item.label}
                  <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/app/builder"
                className="btn-brand btn-brand-shine group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold shadow-[0_16px_48px_-16px_var(--accent-glow)] sm:w-auto"
              >
                Open builder
                <svg className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href={`/@${featuredStore.handle}`}
                className="btn-ghost inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 px-7 text-sm font-semibold backdrop-blur-md sm:w-auto"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[0.65rem] font-bold text-[var(--accent)]">
                  {featuredStore.name.charAt(0)}
                </span>
                @{featuredStore.handle}
              </Link>
            </div>

            <div className="hero-stat-row mt-8 grid grid-cols-3 divide-x divide-[var(--border)] rounded-2xl">
              {[
                { label: "Products", value: featuredStore.productCount },
                { label: "Views", value: featuredStore.viewCount || "—" },
                { label: "Followers", value: featuredStore.followerCount || "—" },
              ].map((stat) => (
                <div key={stat.label} className="px-4 py-3 text-center sm:px-5 sm:py-3.5">
                  <p className="font-display text-lg font-bold tabular-nums tracking-tight text-[var(--foreground)] sm:text-xl">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-[var(--muted)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={`hero-mockup-tilt relative min-w-0 ${reduce ? "" : "hero-mockup-float"}`}
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-preview-glow pointer-events-none absolute -inset-8 rounded-[2.5rem]" aria-hidden />
            <div className="hero-mockup-ring relative">
              <BrowserFrame title="app.mr.software/builder" className="hero-browser-frame relative overflow-hidden rounded-2xl">
                <LandingHeroPreview embedded />
              </BrowserFrame>
            </div>
          </motion.div>

          <motion.div
            className="hidden min-w-0 xl:block"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <LandingHeroLiveStack store={featuredStore} />
          </motion.div>
        </div>

        <motion.div
          className="mt-10 xl:hidden"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5 }}
        >
          <LandingHeroLiveStack store={featuredStore} layout="horizontal" />
        </motion.div>
      </LandingContainer>
    </section>
  );
}
