"use client";

import { motion, useReducedMotion } from "framer-motion";

const PILLARS = [
  {
    title: "Auth",
    blurb: "Sessions backed by the database—roles, status, and JWT invalidation on change.",
  },
  {
    title: "Payments",
    blurb: "Stripe Checkout and webhooks—entitlements and subscriptions stay in PostgreSQL.",
  },
  {
    title: "Deployments",
    blurb: "Upload static sites, get URLs, and enforce quotas per plan—no mystery hosting.",
  },
  {
    title: "Admin controls",
    blurb: "Operator console for users, compliance-style audit logs, and enforcement.",
  },
] as const;

export function TrustInfrastructure() {
  const reduce = useReducedMotion();
  return (
    <section
      className="relative py-20 sm:py-32"
      aria-labelledby="trust-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--surface)]/20 to-[var(--background)]"
        aria-hidden
      />
      <div
        className="bg-noise pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply dark:opacity-15 dark:mix-blend-soft-light"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="trust-heading"
            className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl"
          >
            Built for real systems
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            The boring parts, done so you can ship the interesting ones—without
            hiding behind a slide deck.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {PILLARS.map((p, i) => (
            <motion.li
              key={p.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: reduce ? 0 : i * 0.08, duration: 0.45 }}
              whileHover={reduce ? {} : { scale: 1.02, y: -2 }}
              className="group rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface)]/95 to-[var(--surface)]/80 p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-md transition-shadow hover:border-[var(--accent)]/20 hover:shadow-[0_24px_48px_-12px_rgba(234,88,12,0.12)] dark:from-[var(--surface-elevated)]/90 dark:to-[var(--background)]/40 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            >
              <span className="text-[0.7rem] font-mono text-[var(--accent)]/80">
                0{i + 1}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {p.blurb}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
