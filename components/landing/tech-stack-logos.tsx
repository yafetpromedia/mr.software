"use client";

import { motion, useReducedMotion } from "framer-motion";

const items = [
  { id: "react", name: "React", color: "text-cyan-400" },
  { id: "next", name: "Next.js", color: "text-zinc-100" },
  { id: "node", name: "Node.js", color: "text-emerald-500" },
  { id: "pg", name: "PostgreSQL", color: "text-sky-500" },
  { id: "docker", name: "Docker", color: "text-blue-500" },
  { id: "stripe", name: "Stripe", color: "text-violet-400" },
  { id: "chapa", name: "Chapa", color: "text-amber-400" },
] as const;

function LogoRow() {
  return (
    <>
      {items.map((t) => (
        <div
          key={t.id}
          className="group flex shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 px-7 py-4 shadow-sm backdrop-blur-sm transition duration-300 hover:scale-[1.02] hover:border-[var(--accent)]/30 dark:bg-zinc-900/50"
        >
          <span
            className={`text-sm font-semibold tracking-tight transition duration-300 saturate-0 group-hover:saturate-100 ${t.color}`}
          >
            {t.name}
          </span>
        </div>
      ))}
    </>
  );
}

export function TechStackLogos() {
  const reduce = useReducedMotion();
  return (
    <section
      className="relative overflow-hidden border-b border-[var(--border)] py-16 sm:py-20"
      aria-label="Works with your stack"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(234,88,12,0.08),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.p
          className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Works with your stack
        </motion.p>
        <h2 className="mt-3 text-center text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          Drop into tools you already use
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-[var(--muted)]">
          HTTP APIs, SQL you can read, and payment rails you can audit—no proprietary
          lock-in story required.
        </p>
      </div>

      <div className="relative mt-10">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--background)] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--background)] to-transparent"
          aria-hidden
        />
        <div className="landing-marquee flex w-max gap-4 pr-4">
          <div className="flex shrink-0 gap-4 pl-4">
            <LogoRow />
          </div>
          <div className="flex shrink-0 gap-4" aria-hidden>
            <LogoRow />
          </div>
        </div>
      </div>
    </section>
  );
}
