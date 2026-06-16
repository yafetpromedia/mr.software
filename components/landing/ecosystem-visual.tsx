"use client";

import { motion, useReducedMotion } from "framer-motion";

const NODES = [
  { id: "ai", label: "AI", sub: "Intelligence", x: "50%", y: "18%" },
  { id: "cloud", label: "Cloud", sub: "Infrastructure", x: "82%", y: "42%" },
  { id: "marketplace", label: "Marketplace", sub: "Economy", x: "68%", y: "78%" },
  { id: "studio", label: "Studio", sub: "Launch OS", x: "32%", y: "78%" },
  { id: "academy", label: "Academy", sub: "Growth", x: "18%", y: "42%" },
] as const;

export function EcosystemVisual() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="ai-glow-ring relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md dark:bg-[var(--surface-elevated)]/60"
      initial={reduce ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <motion.div
        className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-[0.15]"
        aria-hidden
        animate={reduce ? undefined : { opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--accent-muted)]/30 via-transparent to-[var(--background)]/40"
        aria-hidden
      />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-[var(--accent)]/25"
        aria-hidden
      >
        <line x1="50%" y1="22%" x2="80%" y2="44%" stroke="currentColor" strokeWidth="1" />
        <line x1="50%" y1="22%" x2="20%" y2="44%" stroke="currentColor" strokeWidth="1" />
        <line x1="50%" y1="22%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="68%" y2="76%" stroke="currentColor" strokeWidth="1" />
        <line x1="50%" y1="50%" x2="32%" y2="76%" stroke="currentColor" strokeWidth="1" />
        <line x1="80%" y1="44%" x2="68%" y2="76%" stroke="currentColor" strokeWidth="1" />
        <line x1="20%" y1="44%" x2="32%" y2="76%" stroke="currentColor" strokeWidth="1" />
      </svg>

      <motion.div
        className="ecosystem-node absolute left-1/2 top-[46%] z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center shadow-lg"
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Core
        </p>
        <p className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">Mr.Software</p>
      </motion.div>

      {NODES.map((node, i) => (
        <motion.div
          key={node.id}
          className="ecosystem-node absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-center shadow-sm dark:bg-[var(--surface-elevated)]"
          style={{ left: node.x, top: node.y }}
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
        >
          <p className="text-xs font-semibold text-[var(--foreground)]">{node.label}</p>
          <p className="text-[0.65rem] text-[var(--muted)]">{node.sub}</p>
        </motion.div>
      ))}

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)]/80 px-3 py-2 text-[0.65rem] text-[var(--muted)] backdrop-blur-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          Ecosystem online
        </span>
        <span>5 systems · 1 platform</span>
      </div>
    </motion.div>
  );
}
