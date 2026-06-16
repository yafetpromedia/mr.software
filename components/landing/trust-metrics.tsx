"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

function useCountUp(
  target: number,
  durationMs: number,
  run: boolean,
  decimals = 0,
) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      const easing = 1 - (1 - t) ** 3;
      const n = target * easing;
      setV(
        decimals
          ? Math.round(n * 10 ** decimals) / 10 ** decimals
          : Math.floor(n),
      );
      if (t < 1) requestAnimationFrame(tick);
      else
        setV(
          decimals
            ? Math.round(target * 10 ** decimals) / 10 ** decimals
            : target,
        );
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, durationMs, run, decimals]);
  return v;
}

export function TrustMetrics() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const run = inView && !reduce;

  const d1 = useCountUp(10, 1400, run, 0);
  const uptime = useCountUp(99.9, 1600, run, 1);
  const rev = useCountUp(100, 1500, run, 0);

  return (
    <section
      className="relative border-b border-[var(--border)] py-20 sm:py-28"
      aria-labelledby="metrics-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--surface)]/40 to-[var(--background)]"
        aria-hidden
      />
      <div
        className="bg-noise pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply dark:opacity-15"
        aria-hidden
      />

      <div ref={ref} className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h2
          id="metrics-heading"
          className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          At a glance
        </motion.h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {[
            {
              value: reduce
                ? "10K+"
                : !inView
                  ? "—"
                  : `${d1}K+`,
              label: "Deployments",
              sub: "static & edge-ready",
            },
            {
              value: reduce
                ? "99.9%"
                : !inView
                  ? "—"
                  : `${uptime.toFixed(1)}%`,
              label: "Uptime target",
              sub: "design for reliability",
            },
            {
              value: reduce
                ? "$100K+"
                : !inView
                  ? "—"
                  : `$${rev}K+`,
              label: "Revenue processed",
              sub: "via connected checkouts",
            },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/90 p-8 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-md dark:bg-[var(--surface-elevated)]/80 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduce ? 0 : i * 0.1 }}
              whileHover={reduce ? {} : { scale: 1.02, y: -4 }}
            >
              <p className="font-mono text-4xl font-bold tabular-nums tracking-tight text-[var(--foreground)] sm:text-5xl">
                <span className="bg-gradient-to-br from-[var(--foreground)] to-[var(--accent)] bg-clip-text text-transparent dark:from-white dark:to-blue-300">
                  {!inView && !reduce ? "—" : m.value}
                </span>
              </p>
              <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                {m.label}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">{m.sub}</p>
            </motion.div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-center text-[0.7rem] leading-relaxed text-[var(--muted)]">
          Figures represent platform-scale goals and aggregate capacity targets we
          engineer toward—your traffic and revenue grow on the same foundations.
        </p>
      </div>
    </section>
  );
}
