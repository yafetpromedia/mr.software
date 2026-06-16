"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const PIPELINE = [
  { step: "Idea", line: "[ai] suggesting market + positioning…", progress: 22 },
  { step: "Branding", line: "[ai] proposing identity draft…", progress: 45 },
  { step: "Website", line: "[ai] drafting landing structure…", progress: 68 },
  { step: "Dashboard", line: "[ai] sketching workspace UI…", progress: 85 },
  { step: "Deploy", line: "[ai] recommending deploy options…", progress: 100 },
] as const;

export function AiStartupBuilder() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const [prompt, setPrompt] = useState("AI-powered marketplace for local services");

  const current = PIPELINE[active];

  useEffect(() => {
    if (reduce) {
      setActive(PIPELINE.length - 1);
      setTyped(PIPELINE[PIPELINE.length - 1]!.line);
      return;
    }
    const stepTimer = window.setInterval(() => {
      setActive((i) => (i + 1) % PIPELINE.length);
    }, 3200);
    return () => window.clearInterval(stepTimer);
  }, [reduce]);

  useEffect(() => {
    if (!current) return;
    if (reduce) {
      setTyped(current.line);
      return;
    }
    setTyped("");
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setTyped(current.line.slice(0, Math.min(current.line.length, i * 3)));
      if (i * 3 >= current.line.length) window.clearInterval(t);
    }, 35);
    return () => window.clearInterval(t);
  }, [active, current, reduce]);

  return (
    <section
      className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-elevated)] py-20 sm:py-28"
      aria-labelledby="ai-builder-heading"
    >
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.08),transparent_70%)] blur-3xl"
        aria-hidden
      />

      <motion.div
        className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            AI assist pipeline
          </p>
          <h2
            id="ai-builder-heading"
            className="mt-3 font-display text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl"
          >
            Drafts you can review, edit, and ship.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
            AI proposes branding, landing layouts, and dashboard sketches — you control what
            becomes production. Export, self-host, or list on the marketplace when ready.
          </p>
          <ul className="mt-6 space-y-2">
            {["Review every AI suggestion", "Edit before deploy", "Own code & hosting"].map(
              (item, i) => (
                <motion.li
                  key={item}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex items-center gap-2 text-sm text-[var(--muted)]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[0.6rem] text-[var(--accent)]">
                    ✓
                  </span>
                  {item}
                </motion.li>
              ),
            )}
          </ul>
          <Link
            href="/app/builder"
            className="btn-brand btn-brand-shine mt-8 inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold"
          >
            Try AI-assisted builder
          </Link>
        </motion.div>

        <motion.div
          className="card-spotlight ai-glow-ring terminal-panel overflow-hidden rounded-3xl border shadow-2xl"
          initial={reduce ? false : { opacity: 0, x: 16, rotateY: 4 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduce ? undefined : { y: -4 }}
        >
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_3px] opacity-30 pointer-events-none"
            aria-hidden
            animate={reduce ? undefined : { backgroundPosition: ["0 0", "0 6px"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="flex items-center gap-2 border-b border-[var(--terminal-border)] px-4 py-3 text-xs terminal-muted"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono">mr-ai — assist pipeline (draft)</span>
          </motion.div>

          <div className="border-b border-[var(--terminal-border)] px-4 py-3">
            <label className="text-[0.6rem] uppercase tracking-wider terminal-muted">
              Startup idea
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs outline-none transition focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="Describe your startup…"
            />
          </div>

          <motion.div
            className="flex gap-1 overflow-x-auto border-b border-[var(--terminal-border)] px-2 py-2"
            layout
          >
            {PIPELINE.map((p, i) => (
              <button
                key={p.step}
                type="button"
                onClick={() => setActive(i)}
                className={`relative shrink-0 rounded-md px-2.5 py-1 text-[0.65rem] font-medium transition ${
                  i === active
                    ? "bg-[var(--accent)]/25 text-emerald-300"
                    : "terminal-muted hover:text-[var(--terminal-fg)]"
                }`}
              >
                {p.step}
                {i === active ? (
                  <motion.span
                    layoutId="pipeline-tab"
                    className="absolute inset-0 rounded-md border border-[var(--accent)]/40"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
              </button>
            ))}
          </motion.div>

          <motion.div
            key={active}
            className="px-4 pt-3"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-1 overflow-hidden rounded-full bg-black/30"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-deep)] to-[var(--accent)]"
                animate={{ width: `${current?.progress ?? 0}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          </motion.div>

          <div className="min-h-[9rem] space-y-2 p-4 font-mono text-xs leading-relaxed">
            <motion.p
              key={typed}
              className="text-emerald-400/90"
              initial={reduce ? false : { opacity: 0.6 }}
              animate={{ opacity: 1 }}
            >
              {typed}
              <span className="terminal-cursor ml-0.5 inline-block h-3 w-1.5 bg-emerald-400/80" />
            </motion.p>
            <p className="terminal-muted">
              → output: review draft → export / deploy on your infrastructure
            </p>
            <motion.div
              className="mt-3 grid gap-1.5 rounded-lg border border-[var(--terminal-border)] bg-black/20 p-2"
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {["Landing draft ready", "Dashboard sketch", "Deploy options listed"].map(
                (row, i) => (
                  <div
                    key={row}
                    className="flex items-center justify-between text-[0.65rem] terminal-muted"
                  >
                    <span>{row}</span>
                    <span
                      className={
                        i <= active ? "text-emerald-400/80" : "text-zinc-600"
                      }
                    >
                      {i <= active ? "✓" : "·"}
                    </span>
                  </div>
                ),
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
