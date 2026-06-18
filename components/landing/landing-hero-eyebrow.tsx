"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LandingHeroEyebrow() {
  const reduce = useReducedMotion();

  return (
    <motion.p
      className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-orange-200 sm:text-sm"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-orange-300" aria-hidden />
      Build · Sell · Deploy
    </motion.p>
  );
}
