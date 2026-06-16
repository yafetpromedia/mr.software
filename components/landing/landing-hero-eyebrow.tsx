"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LandingHeroEyebrow() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="hero-eyebrow inline-flex max-w-full flex-wrap items-center gap-2 rounded-full px-1.5 py-1.5 pr-4 sm:gap-3 sm:pr-5"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-[var(--background)]">
        <span
          className={`relative flex h-1.5 w-1.5 ${reduce ? "" : ""}`}
          aria-hidden
        >
          <span className={`absolute inset-0 rounded-full bg-emerald-400 ${reduce ? "" : "animate-ping opacity-60"}`} />
          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Live
      </span>
      <span className="text-[0.72rem] font-semibold tracking-tight text-[var(--foreground)]">
        Build · Sell · Deploy
      </span>
      <span className="hidden h-3.5 w-px bg-[var(--border)] sm:inline" aria-hidden />
      <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-medium text-[var(--muted)]">
        Chapa &amp; Telebirr
      </span>
    </motion.div>
  );
}
