"use client";

import { Fragment, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    key: "upload",
    label: "Upload",
    title: "Upload",
    copy: "Drop a production build or connect your API—artifacts stay versioned and traceable.",
    preview: "upload" as const,
  },
  {
    key: "deploy",
    label: "Deploy",
    title: "Deploy",
    copy: "Health checks, logs, and a public URL the moment the bundle is live.",
    preview: "deploy" as const,
  },
  {
    key: "discover",
    label: "Discover",
    title: "Discover",
    copy: "Searchable marketplace on web, Play Store, and App Store — entitlement-backed downloads for every buyer.",
    preview: "discover" as const,
  },
  {
    key: "earn",
    label: "Earn",
    title: "Earn",
    copy: "Checkout, renewals, and revenue records tied to real accounts in Postgres.",
    preview: "earn" as const,
  },
] as const;

function StepPreview({ kind }: { kind: (typeof STEPS)[number]["preview"] }) {
  if (kind === "upload")
    return (
      <div className="mt-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/80 p-3 dark:bg-zinc-950/40">
        <div className="flex items-center justify-between text-[0.65rem] font-mono text-[var(--muted)]">
          <span className="text-[var(--foreground)]">site.zip</span>
          <span>4.1 MB</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[var(--accent)] to-orange-400" />
        </div>
        <p className="mt-1.5 text-[0.6rem] text-[var(--muted)]">Static bundle · verified</p>
      </div>
    );
  if (kind === "deploy")
    return (
      <div className="mt-3 space-y-1.5 rounded-xl border border-[var(--border)] bg-zinc-950/90 p-3 font-mono text-[0.6rem] leading-relaxed text-zinc-400">
        <p className="text-emerald-400/90">[edge] region global · OK</p>
        <p className="text-zinc-500">[build] 1284 modules · 1.2s</p>
        <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-[var(--accent)] to-amber-400" />
        </div>
      </div>
    );
  if (kind === "discover")
    return (
      <div className="mt-3 space-y-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)]/80 p-2.5 dark:bg-zinc-950/50">
        <div className="mb-1 flex items-center gap-1.5 rounded-lg bg-[var(--surface)]/90 px-2 py-1 text-[0.6rem] text-[var(--muted)]">
          <span className="text-[var(--accent)]">⌕</span> analytics kit…
        </div>
        {["ShipKit Pro", "Data layer API"].map((n) => (
          <div
            key={n}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] px-2 py-1.5 text-[0.6rem]"
          >
            <span className="text-[var(--foreground)]">{n}</span>
            <span className="text-[var(--accent)]">View</span>
          </div>
        ))}
      </div>
    );
  return (
    <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--background)]/80 p-3 dark:bg-zinc-950/50">
      <div className="flex h-10 items-end gap-1.5">
        {[40, 70, 45, 90].map((h, i) => (
          <div
            key={i}
            className="w-2 rounded-t bg-gradient-to-t from-[var(--accent)]/40 to-[var(--accent)]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-[0.7rem] font-semibold text-[var(--foreground)]">
        $4.2k <span className="text-[var(--muted)] font-normal">this month</span>
      </p>
    </div>
  );
}

function Connector() {
  const reduce = useReducedMotion();
  return (
    <div
      className="relative hidden min-h-[1px] w-14 shrink-0 items-center self-center justify-center px-0 pt-10 lg:flex"
      aria-hidden
    >
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <motion.div
          className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[var(--accent)]/30 via-[var(--accent)] to-[var(--accent)]/40"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={reduce ? undefined : { scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <motion.div
        className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[4px] border-l-[5px] border-y-transparent border-l-[var(--accent)]"
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        whileInView={reduce ? undefined : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      />
    </div>
  );
}

export function HowItWorksFlow() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      className="relative overflow-hidden border-b border-[var(--border)] py-20 sm:py-28"
      aria-labelledby="how-flow-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(234,88,12,0.1),transparent)]"
        aria-hidden
      />
      <div
        className="bg-noise pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply dark:opacity-20"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
        >
          <span className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] backdrop-blur-sm">
            Platform flow
          </span>
          <h2
            id="how-flow-heading"
            className="mt-5 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl"
          >
            Upload → Deploy → Discover → Earn
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            A single pipeline that stays visible in the product—not a diagram you
            only see in a slide deck.
          </p>
        </motion.div>

        <div className="mt-16 flex flex-col gap-1 lg:mt-20 lg:flex-row lg:items-stretch lg:gap-0">
          {STEPS.map((step, i) => (
            <Fragment key={step.key}>
              <motion.article
                className="group relative min-w-0 flex-1"
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{
                  delay: reduce ? 0 : i * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 22,
                }}
                whileHover={reduce ? {} : { y: -6, scale: 1.02 }}
                style={{ zIndex: hovered === i ? 20 : 1 }}
              >
                <div
                  className="relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface)]/95 to-[var(--surface)]/80 p-5 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-[box-shadow,transform] duration-500 group-hover:shadow-[0_28px_60px_-12px_rgba(234,88,12,0.16),0_0_0_1px_rgba(234,88,12,0.1)] dark:from-[var(--surface-elevated)]/90 dark:to-[var(--background)]/60 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] dark:group-hover:shadow-[0_32px_64px_-16px_rgba(251,146,60,0.12)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-orange-500 text-xs font-bold text-white shadow-lg shadow-[var(--accent-glow)]">
                        {i + 1}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                        {step.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e] opacity-60 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="relative mt-3 text-lg font-bold text-[var(--foreground)]">
                    {step.title}
                  </h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                    {step.copy}
                  </p>
                  <div className="relative mt-auto pt-2">
                    <StepPreview kind={step.preview} />
                  </div>
                </div>
              </motion.article>
              {i < STEPS.length - 1 ? (
                <>
                  <div
                    className="flex h-7 shrink-0 items-center justify-center text-[var(--accent)]/60 lg:hidden"
                    aria-hidden
                  >
                    ↓
                  </div>
                  <Connector />
                </>
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
