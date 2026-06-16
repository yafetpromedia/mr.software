"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const LOG_LINES = [
  "[build] installing dependencies…",
  "[build] vite v5.4.0 — 1284 modules transformed",
  "[deploy] uploading static bundle…",
  "[deploy] provisioning edge origin…",
  "[deploy] ✓ health check passed",
  "[mr.software] LIVE — project.mrsoftware.app",
] as const;

export function DeployPreviewPanel() {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (reduce) {
      setProgress(100);
      setVisibleLogs(LOG_LINES.length);
      setRunning(false);
      return;
    }

    const logInterval = window.setInterval(() => {
      setVisibleLogs((n) => {
        if (n >= LOG_LINES.length) {
          window.clearInterval(logInterval);
          return n;
        }
        return n + 1;
      });
    }, 520);

    const progressInterval = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, p + 3);
      });
    }, 95);

    const done = window.setTimeout(() => {
      setProgress(100);
      setVisibleLogs(LOG_LINES.length);
      setRunning(false);
      window.clearInterval(logInterval);
      window.clearInterval(progressInterval);
    }, 4200);

    return () => {
      window.clearInterval(logInterval);
      window.clearInterval(progressInterval);
      window.clearTimeout(done);
    };
  }, [reduce]);

  const lines = LOG_LINES.slice(0, visibleLogs);

  return (
    <div className="relative w-full max-w-lg">
      <div
        className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[var(--accent)]/25 via-[var(--accent)]/5 to-orange-200/20 blur-2xl dark:from-[var(--accent)]/20 dark:to-[var(--accent)]/5"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.03)] backdrop-blur-xl dark:bg-[var(--surface-elevated)]/80 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)]">
        <div className="flex h-9 items-center gap-2 border-b border-[var(--border)] bg-[var(--background)]/60 px-3 dark:bg-[var(--background)]/40">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 text-[0.7rem] font-mono text-[var(--muted)]">
            deploy / production
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 p-3 dark:bg-[var(--background)]/30">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-semibold text-[var(--foreground)]">
                api-dashboard
              </p>
              <p className="mt-1 truncate text-xs text-[var(--muted)]">
                <span className="text-[var(--accent)]">https://</span>
                project.mrsoftware.app
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#22c55e]" />
                active
              </span>
              <p className="mt-1 text-[0.65rem] text-[var(--muted)]">just now</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-wider text-[var(--muted)]">
              <span>Build &amp; deploy</span>
              <span className="font-mono tabular-nums text-[var(--foreground)]">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] via-orange-400 to-amber-300"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 50, damping: 26 }
                }
              />
            </div>
          </div>

          <div className="mt-4 max-h-[9.5rem] overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0a0a0a] p-3 font-mono text-[0.7rem] leading-relaxed text-zinc-300 sm:max-h-[10.5rem]">
            {lines.map((line, i) => (
              <motion.p
                key={`${i}-${line}`}
                className="border-l-2 border-[var(--accent)]/50 pl-2"
                initial={reduce ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-zinc-500">$</span> {line}
              </motion.p>
            ))}
            {running ? (
              <p className="mt-1 pl-2 text-amber-400/80" aria-hidden>
                ▌
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
