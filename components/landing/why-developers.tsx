"use client";

import { motion, useReducedMotion } from "framer-motion";

const benefits = [
  {
    title: "One data model, many surfaces",
    text: "Catalog, checkout, and admin all read the same PostgreSQL—no more reconciling three dashboards.",
  },
  {
    title: "Batteries-included security posture",
    text: "JWT + server validation, download tokens, and admin audit logs designed for real operators.",
  },
  {
    title: "Ship faster without glue code",
    text: "Deploy static bundles, entitle buyers, and govern accounts without bolting on a second auth product.",
  },
] as const;

export function WhyDevelopers() {
  const reduce = useReducedMotion();
  return (
    <section
      className="relative border-b border-[var(--border)] py-20 sm:py-28"
      aria-labelledby="why-dev-heading"
    >
      <div
        className="bg-noise pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply dark:opacity-15"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2
              id="why-dev-heading"
              className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl"
            >
              Why developers choose us
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Build on infrastructure that works the way your repo does: explicit,
              reviewable, and easy to reason about under load.
            </p>
            <ul className="mt-8 space-y-5">
              {benefits.map((b, i) => (
                <motion.li
                  key={b.title}
                  className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-5 shadow-sm backdrop-blur-sm transition hover:border-[var(--accent)]/25 dark:bg-[var(--surface-elevated)]/60"
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: reduce ? 0 : i * 0.1 }}
                >
                  <span className="text-xs font-mono text-[var(--accent)]/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {b.text}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-zinc-950 p-1 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.4)]"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={reduce ? {} : { scale: 1.01 }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
          >
            <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-[0.65rem] text-zinc-500">
                GET /api/software · 200
              </span>
            </div>
            <div className="p-4 font-mono text-[0.7rem] leading-relaxed">
              <p>
                <span className="text-violet-400">export</span>{" "}
                <span className="text-amber-300">async</span>{" "}
                <span className="text-sky-300">function</span>{" "}
                <span className="text-emerald-300">listCatalog</span>
                <span className="text-zinc-500">() {"{"}</span>
              </p>
              <p className="mt-1 pl-3 text-zinc-400">
                <span className="text-violet-400">const</span> rows ={" "}
                <span className="text-amber-300">await</span> prisma
                .software.findMany
                <span className="text-zinc-500">(...)</span>
              </p>
              <p className="mt-1 pl-3 text-zinc-500">{"// entitlements, prices, not raw asset URLs"}</p>
              <p className="mt-1 pl-3 text-zinc-300">
                <span className="text-violet-400">return</span>{" "}
                <span className="text-cyan-300">Response</span>
                <span className="text-zinc-500">.json(</span>rows
                <span className="text-zinc-500">)</span>
              </p>
              <p className="text-zinc-500">{"}"}</p>
            </div>
            <div className="border-t border-zinc-800 bg-zinc-900/50 px-4 py-2 text-[0.65rem] text-zinc-500">
              <span className="text-emerald-500">●</span> last deploy · 2m ago ·
              production
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--accent)]/20 blur-3xl" aria-hidden />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
