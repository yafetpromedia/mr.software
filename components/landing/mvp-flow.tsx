"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    step: "01",
    title: "Idea",
    icon: "💡",
    desc: "Describe your product. AI suggests structure, features, and tech direction — you refine what ships.",
  },
  {
    step: "02",
    title: "Build",
    icon: "⚡",
    desc: "Beginner mode for guided drafts, or Developer mode for code access, export, and manual control.",
  },
  {
    step: "03",
    title: "Deploy & monetize",
    icon: "🚀",
    desc: "Host on Mr.Software Cloud (coming), your VPS, Hostinger, or elsewhere — or sell in the marketplace.",
  },
] as const;

export function MvpFlow() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative border-b border-[var(--border)] py-20 sm:py-28"
      aria-labelledby="mvp-flow-heading"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-mesh opacity-60"
        aria-hidden
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="text-center"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            How it works
          </p>
          <h2
            id="mvp-flow-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Idea → Build → Deploy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--muted)]">
            From idea to deployed product — with AI assistance, not full automation.
          </p>
        </motion.div>

        <div className="relative mt-14">
          <svg
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-12 hidden h-px w-[66.66%] md:block"
            aria-hidden
          >
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke="rgba(249, 115, 22, 0.25)"
              strokeWidth="1"
              className={reduce ? "" : "flow-line-animated"}
            />
          </svg>

          <ul className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.step}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduce ? undefined : { y: -6, transition: { duration: 0.25 } }}
                className="modern-card gradient-border-hover group relative overflow-hidden rounded-3xl p-6"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--accent)]/10 blur-2xl transition duration-500 group-hover:bg-[var(--accent)]/25"
                  aria-hidden
                />
                <motion.span
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-lg"
                  whileHover={reduce ? undefined : { rotate: [0, -8, 8, 0], scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                >
                  {s.icon}
                </motion.span>
                <span className="mt-4 block font-mono text-xs font-semibold text-[var(--accent)]">
                  {s.step}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/app/builder"
            className="btn-brand btn-brand-shine inline-flex h-12 items-center justify-center rounded-xl px-8 text-sm font-semibold"
          >
            Open builder workspace
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
