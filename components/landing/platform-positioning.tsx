"use client";

import { motion, useReducedMotion } from "framer-motion";

const PILLARS = [
  {
    title: "AI assists — you decide",
    desc: "Suggestions for structure, UI drafts, and architecture. You review, edit, and own every output.",
    icon: "✦",
  },
  {
    title: "Developer control",
    desc: "Full code access, project export, and deploy on Mr.Software Cloud via ZIP or GitHub — Node, PHP, Python, and static builds supported.",
    icon: "</>",
  },
  {
    title: "Open ecosystem",
    desc: "Publish templates, sell blueprints, or self-host. A digital product economy for builders — not a closed AI tool.",
    icon: "◎",
  },
] as const;

export function PlatformPositioning() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--background)] py-20 sm:py-24"
      aria-labelledby="positioning-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(249,115,22,0.06),transparent)]"
        aria-hidden
      />

      <motion.div
        className="relative mx-auto max-w-6xl px-4 sm:px-6"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Platform philosophy
        </p>
        <h2
          id="positioning-heading"
          className="mx-auto mt-3 max-w-2xl text-center font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          AI enhances builders — it does not replace them
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          An open, AI-assisted development platform. Design, build, deploy, and monetize with full
          control over code and hosting.
        </p>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.li
              key={p.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              whileHover={reduce ? undefined : { y: -5 }}
              className="card-spotlight modern-card group rounded-3xl p-6"
            >
              <motion.span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-muted)] font-mono text-sm text-[var(--accent)]"
                whileHover={reduce ? undefined : { scale: 1.1, rotate: 5 }}
              >
                {p.icon}
              </motion.span>
              <h3 className="mt-4 font-semibold text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{p.desc}</p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
