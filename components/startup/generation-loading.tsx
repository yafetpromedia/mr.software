"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
      className="relative flex h-full min-h-[22rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 shadow-[var(--shadow-card)] sm:min-h-[26rem]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,var(--accent-muted),transparent_65%)]"
        aria-hidden
      />

      <motion.div className="relative h-16 w-16">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-[var(--accent-muted)]"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[var(--accent)]">
          <Sparkles className="h-6 w-6" aria-hidden />
        </span>
      </motion.div>

      <div className="relative text-center">
        <p className="text-sm font-semibold text-[var(--foreground)]">AI is drafting your startup</p>
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 font-mono text-xs text-[var(--muted)]"
        >
          {label}
        </motion.p>
      </div>

      <div className="relative flex gap-1.5">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            className={`h-1 rounded-full transition-all ${
              i <= step ? "w-8 bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]" : "w-5 bg-[var(--border)]"
            }`}
            animate={i <= step ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}
