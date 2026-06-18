"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HeroFeaturedStore } from "@/components/landing/landing-hero-live-stack";

const STEPS = ["Idea", "Draft", "Deploy"] as const;

const MODULES = [
  { label: "Landing page", status: "Ready" },
  { label: "Dashboard", status: "Ready" },
  { label: "Storefront", status: "Live" },
] as const;

export function LandingHeroVisual({ store }: { store: HeroFeaturedStore }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto w-full"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.24),transparent_72%)] sm:-inset-5"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#120904]/95 shadow-[0_28px_80px_-28px_rgba(249,115,22,0.62)]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3.5 py-2.5 sm:px-4 sm:py-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="ml-1 truncate font-mono text-[0.7rem] text-white/60">
            app.mr.software/builder
          </span>
        </div>

        <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step, index) => (
              <span
                key={step}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  index === STEPS.length - 1
                    ? "bg-orange-500 text-white"
                    : "bg-white/10 text-white/85"
                }`}
              >
                {step}
              </span>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/55">
              Startup draft
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-white/90">
              {store.tagline ?? "Fitness tracker SaaS for busy professionals"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 min-[520px]:grid-cols-3">
            {MODULES.map((module) => (
              <div
                key={module.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 sm:py-3"
              >
                <p className="text-xs font-medium text-white/90">{module.label}</p>
                <p className="mt-1 text-[0.65rem] font-semibold text-emerald-400">
                  {module.status}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 sm:px-4">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/55">
                Your store
              </p>
              <p className="truncate font-mono text-sm text-white/95">@{store.handle}</p>
            </div>
            <span className="shrink-0 rounded-full bg-orange-500/20 px-2.5 py-1 text-[0.65rem] font-semibold text-orange-300">
              {store.productCount} products
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
