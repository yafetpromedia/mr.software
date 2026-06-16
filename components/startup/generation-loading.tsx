"use client";

import { motion } from "framer-motion";

const STEPS = [
  "Understanding your idea…",
  "Suggesting brand direction…",
  "Drafting landing structure…",
  "Sketching dashboard preview…",
  "Preparing reviewable draft…",
] as const;

export function GenerationLoading({ step = 0 }: { step?: number }) {
  const label = STEPS[Math.min(step, STEPS.length - 1)];

  return (
    <motion.div
      className="glass-panel flex flex-col items-center justify-center gap-6 rounded-2xl p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="relative h-14 w-14">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-[var(--accent-muted)]"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-lg text-[var(--accent)]">
          ✦
        </span>
      </motion.div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[var(--foreground)]">AI assisting…</p>
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 font-mono text-xs text-[var(--muted)]"
        >
          {label}
        </motion.p>
      </div>
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 w-6 rounded-full transition ${
              i <= step ? "bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
