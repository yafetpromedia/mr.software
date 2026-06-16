"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";

const NODES = [
  {
    id: "ai",
    label: "AI",
    sub: "Intelligence",
    x: "50%",
    y: "16%",
    href: "/auth/register",
    preview: "Startup generation, branding, dashboards, and copilots.",
  },
  {
    id: "cloud",
    label: "Cloud",
    sub: "Infrastructure",
    x: "84%",
    y: "42%",
    href: "/deploy",
    preview: "Deployments, pipelines, and scalable hosting.",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    sub: "Economy",
    x: "70%",
    y: "80%",
    href: "/marketplace",
    preview: "Monetize software, agents, and digital products.",
  },
  {
    id: "studio",
    label: "Studio",
    sub: "Launch OS",
    x: "30%",
    y: "80%",
    href: "/app",
    preview: "Command center for projects, revenue, and launch.",
  },
  {
    id: "academy",
    label: "Academy",
    sub: "Growth",
    x: "16%",
    y: "42%",
    href: "/#vision",
    preview: "Education and ecosystem acceleration programs.",
  },
] as const;

export function EcosystemDiagram({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const selected = NODES.find((n) => n.id === active);

  return (
    <motion.div
      className={`ai-glow-ring relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--graphite)] ${className}`}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="bg-grid-pattern system-pulse pointer-events-none absolute inset-0 opacity-20" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--accent-muted)]/20 via-transparent to-[var(--background)]"
        aria-hidden
      />

      <svg className="pointer-events-none absolute inset-0 h-full w-full text-[var(--accent)]/30" aria-hidden>
        <line x1="50%" y1="20%" x2="82%" y2="44%" stroke="currentColor" strokeWidth="1" />
        <line x1="50%" y1="20%" x2="18%" y2="44%" stroke="currentColor" strokeWidth="1" />
        <line x1="50%" y1="48%" x2="68%" y2="78%" stroke="currentColor" strokeWidth="1" />
        <line x1="50%" y1="48%" x2="32%" y2="78%" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="ecosystem-node absolute left-1/2 top-[46%] z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center shadow-lg">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Core</p>
        <p className="text-sm font-semibold">Mr.Software</p>
      </div>

      {NODES.map((node) => (
        <button
          key={node.id}
          type="button"
          onMouseEnter={() => setActive(node.id)}
          onFocus={() => setActive(node.id)}
          onClick={() => setActive(node.id)}
          className={`ecosystem-node absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border px-3 py-2 text-center transition ${
            active === node.id
              ? "border-[var(--accent)]/50 bg-[var(--accent-muted)]"
              : "border-[var(--border)] bg-[var(--surface)]"
          }`}
          style={{ left: node.x, top: node.y }}
        >
          <p className="text-xs font-semibold">{node.label}</p>
          <p className="text-[0.65rem] text-[var(--muted)]">{node.sub}</p>
        </button>
      ))}

      <AnimatePresence>
        {selected ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-3 left-3 right-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 backdrop-blur-md"
          >
            <p className="text-sm font-semibold">{selected.label} · {selected.sub}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{selected.preview}</p>
            <Link href={selected.href} className="mt-2 inline-block text-xs font-medium text-[var(--accent)]">
              Open module →
            </Link>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-3 left-3 right-3 text-center text-[0.65rem] text-[var(--muted)]"
          >
            Hover a node to preview connected systems
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
