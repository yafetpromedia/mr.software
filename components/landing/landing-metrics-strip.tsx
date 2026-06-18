"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const METRICS = [
  { value: "@handle", label: "Creator stores", sub: "public storefronts" },
  { value: "Chapa", label: "Local payments", sub: "Telebirr & Stripe" },
  { value: "AI + You", label: "Builder flow", sub: "assist, then own it" },
] as const;

export function LandingMetricsStrip() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section
      className="relative border-b border-[var(--border)] bg-[var(--background)] py-10 sm:py-12"
      aria-label="Platform highlights"
    >
      <motion.div
        ref={ref}
        className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3 sm:gap-6 sm:px-6"
        initial={reduce ? false : { opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            className="modern-card card-interactive group relative overflow-hidden px-5 py-5 text-center sm:text-left"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            whileHover={reduce ? undefined : { y: -3 }}
          >
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--accent)]/10 blur-2xl transition group-hover:bg-[var(--accent)]/20"
              aria-hidden
            />
            <p className="font-display text-2xl font-bold tabular-nums text-brand-gradient-static">
              {m.value}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{m.label}</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">{m.sub}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
