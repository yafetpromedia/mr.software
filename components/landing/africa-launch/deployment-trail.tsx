"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DEPLOYMENT_ARCS, HUB } from "@/lib/landing/africa-hero-data";

type Props = {
  activeArcCount: number;
};

export function DeploymentTrail({ activeArcCount }: Props) {
  const reduce = useReducedMotion();
  const arcs = DEPLOYMENT_ARCS.slice(0, activeArcCount);

  if (arcs.length === 0) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="africa-stat-card max-w-xs"
      aria-label="Deployment trail from Africa"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        Launch path
      </p>
      <div className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed text-white/70">
        <p className="text-white">
          {HUB.label} {HUB.flag}
        </p>
        {arcs.map((arc, i) => (
          <motion.div
            key={arc.id}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.12 }}
          >
            <p className="text-white/25">↓</p>
            <p className="text-[#ffb07a]">{arc.product}</p>
            <p className="text-white/25">↓</p>
            <p>
              {arc.endLabel} {arc.endFlag}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
