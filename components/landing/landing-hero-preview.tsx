"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = ["Idea", "Draft", "Review", "Deploy"] as const;

const LOG_LINES = [
  "[assist] market + positioning for East Africa",
  "[assist] landing + pricing page structure",
  "[assist] dashboard modules + auth flow",
  "[you] export → GitHub · deploy VPS",
] as const;

const SIDEBAR = [
  { label: "Builder", active: true },
  { label: "Market", active: false },
  { label: "Store", active: false },
  { label: "Deploy", active: false },
] as const;

function SidebarIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 ${active ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      {active ? (
        <rect x="2" y="2" width="12" height="12" rx="2" />
      ) : (
        <rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      )}
    </svg>
  );
}

export function LandingHeroPreview({ embedded = false }: { embedded?: boolean }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStep(STEPS.length - 1);
      setLineIdx(LOG_LINES.length - 1);
      return;
    }
    const t = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 3200);
    return () => window.clearInterval(t);
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    setLineIdx(0);
    const t = window.setInterval(() => {
      setLineIdx((i) => Math.min(i + 1, LOG_LINES.length - 1));
    }, 520);
    return () => window.clearInterval(t);
  }, [step, reduce]);

  const wrap = embedded ? "bg-[var(--surface)]" : "modern-card relative mt-14 max-w-4xl";

  return (
    <motion.div className={wrap} layout={!embedded}>
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-gradient-to-r from-[var(--surface-elevated)] to-[var(--surface)] px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)]/50 px-2.5 py-1.5">
          <svg className="h-3 w-3 shrink-0 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <span className="truncate font-mono text-[0.62rem] text-[var(--muted)]">
            builder/session/startup-draft
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[0.55rem] font-semibold text-emerald-700 dark:text-emerald-400 sm:inline">
            Saved
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-orange-600 text-[0.6rem] font-bold text-white shadow-sm">
            Y
          </span>
        </div>
      </div>

      <div className="flex min-h-[15rem]">
        <aside className="hidden w-[3.25rem] shrink-0 flex-col gap-1 border-r border-[var(--border)] bg-[var(--surface-elevated)]/40 p-1.5 sm:flex">
          {SIDEBAR.map((item) => (
            <span
              key={item.label}
              className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-center transition ${
                item.active
                  ? "bg-[var(--accent-muted)] shadow-sm"
                  : "text-[var(--muted)] hover:bg-[var(--surface-elevated)]"
              }`}
            >
              <SidebarIcon active={item.active} />
              <span className="text-[0.5rem] font-semibold leading-tight">{item.label}</span>
            </span>
          ))}
        </aside>

        <div className="grid min-w-0 flex-1 lg:grid-cols-[1fr_1.05fr]">
          <div className="border-b border-[var(--border)] p-4 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Startup idea
              </p>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[0.55rem] font-bold text-emerald-700 dark:text-emerald-400">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                AI on
              </span>
            </div>
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--background)]/60 to-[var(--surface-elevated)]/40 p-3 shadow-inner">
              <p className="font-mono text-[0.74rem] leading-relaxed text-[var(--foreground)]">
                Fitness tracker SaaS for busy professionals in Addis
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[0.55rem] text-[var(--muted)]">
                <span>58 chars</span>
                <span className="rounded bg-[var(--surface-elevated)] px-1.5 py-0.5 font-medium">Beginner</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1">
              {STEPS.map((s, i) => (
                <span
                  key={s}
                  className={`rounded-lg px-2.5 py-1 text-[0.62rem] font-bold transition-all duration-400 ${
                    i === step
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25"
                      : i < step
                        ? "bg-[var(--surface-elevated)] text-[var(--foreground)]"
                        : "text-[var(--muted)]"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] via-orange-500 to-amber-400"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.45 }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-1.5">
              {["Landing", "Pricing", "Dashboard"].map((m, i) => (
                <div
                  key={m}
                  className={`rounded-lg border px-2 py-2.5 text-center text-[0.58rem] font-semibold transition ${
                    i <= step
                      ? "border-[var(--accent)]/35 bg-[var(--accent-muted)]/50 text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>

          <div className="terminal-panel relative flex min-h-[10rem] flex-col overflow-hidden p-3.5 font-mono text-[0.66rem] leading-relaxed">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" aria-hidden />
            <div className="relative flex flex-1 flex-col">
              <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                <p className="text-[0.58rem] font-medium text-zinc-500">mr-builder — zsh</p>
                <div className="flex gap-1">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[0.5rem] text-zinc-400">assist</span>
                  <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[0.5rem] text-emerald-500">live</span>
                </div>
              </div>
              <div className="flex-1 space-y-0.5">
                {LOG_LINES.slice(0, lineIdx + 1).map((line, i) => (
                  <p
                    key={`${step}-${line}`}
                    className={i === lineIdx ? "text-emerald-400" : "text-zinc-500"}
                  >
                    {line}
                    {i === lineIdx ? (
                      <span className="terminal-cursor ml-0.5 inline-block h-3 w-1 bg-emerald-400" />
                    ) : null}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--surface-elevated)]/80 px-4 py-2.5 text-[0.62rem]">
        <div className="flex flex-wrap items-center gap-2 text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">Export</span>
          {["GitHub", "VPS", "Chapa", "Stripe"].map((item, i) => (
            <span key={item} className="inline-flex items-center gap-2">
              {i > 0 ? <span className="text-[var(--border)]">·</span> : null}
              {item}
            </span>
          ))}
        </div>
        <span className="font-bold text-[var(--accent)]">You own the output</span>
      </div>
    </motion.div>
  );
}
