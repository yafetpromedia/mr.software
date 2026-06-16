"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function GlobalVision() {
  const reduce = useReducedMotion();

  return (
    <section
      id="vision"
      className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--background)] py-24 sm:py-32"
      aria-labelledby="vision-heading"
    >
      <div className="landing-hero-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-hero-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-hero-vignette pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="bg-noise pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply dark:opacity-10"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-[var(--accent)]/6 blur-[100px]"
        animate={reduce ? undefined : { opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <motion.div
        className="relative mx-auto max-w-4xl px-4 text-center sm:px-6"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          Mr.Software 2.0
        </p>
        <h2
          id="vision-heading"
          className="mt-4 text-balance font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-4xl lg:text-5xl"
        >
          The software business operating system for{" "}
          <span className="text-brand-gradient">builders &amp; Africa</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-[var(--muted)] sm:text-lg">
          Build, deploy, sell, manage, and scale from one platform. Every developer gets a storefront
          at{" "}
          <span className="rounded-md border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-sm text-stone-800 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--foreground)]">
            /@yourname
          </span>{" "}
          — not just another anonymous listing.
        </p>
        <ul className="mx-auto mt-8 grid max-w-3xl gap-3 text-left text-sm sm:grid-cols-3">
          {[
            {
              title: "Marketplace",
              copy: "Sell SaaS, templates, APIs",
            },
            {
              title: "Cloud",
              copy: "Deploy without external hosting",
            },
            {
              title: "Payments",
              copy: "Stripe today · African rails next",
            },
          ].map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3.5 shadow-[var(--shadow-card)] dark:border-[var(--border)] dark:bg-[var(--surface)]"
            >
              <strong className="text-stone-900 dark:text-[var(--foreground)]">{item.title}</strong>
              <p className="mt-1 text-stone-600 dark:text-[var(--muted)]">{item.copy}</p>
            </li>
          ))}
        </ul>
        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <Link
            href="/auth/register"
            className="btn-brand inline-flex h-12 min-w-[11rem] items-center justify-center rounded-2xl px-8 text-sm font-semibold shadow-sm"
          >
            Open your storefront
          </Link>
          <Link
            href="/academy"
            className="inline-flex h-12 min-w-[11rem] items-center justify-center rounded-2xl border border-stone-200 bg-white px-8 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-orange-300 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--foreground)] dark:hover:border-[var(--accent)]/40"
          >
            Mr.Software Academy
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex h-12 min-w-[11rem] items-center justify-center rounded-2xl border border-stone-200 bg-white px-8 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-orange-300 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--foreground)] dark:hover:border-[var(--accent)]/40"
          >
            Explore marketplace
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
