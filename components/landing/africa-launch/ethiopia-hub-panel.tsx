"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EthiopiaFlagIcon } from "@/components/icons/ethiopia-flag-icon";
import { COMMAND_STATS } from "@/lib/landing/africa-hero-data";

type Props = {
  revenueBoost?: number;
  visible?: boolean;
};

export function EthiopiaHubPanel({ revenueBoost = 0, visible = true }: Props) {
  const reduce = useReducedMotion();
  const revenue = COMMAND_STATS.revenue + revenueBoost;

  if (!visible) return null;

  return (
    <motion.div
      className="ethiopia-hub-panel pointer-events-none absolute left-1/2 top-[14%] z-10 -translate-x-1/2 sm:top-[15%]"
      initial={reduce ? false : { opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 2.4, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ethiopia-hub-panel-glow" aria-hidden />
      <div className="ethiopia-hub-panel-ring" aria-hidden />

      <div className="ethiopia-hub-panel-core">
        <div className="flex items-center gap-2">
          <EthiopiaFlagIcon className="h-5 w-8 shrink-0 rounded-[3px] shadow-md ring-1 ring-black/10" />
          <div>
            <p className="ethiopia-hub-panel-label">Ethiopia Hub</p>
            <p className="ethiopia-hub-panel-origin">Launch origin · Addis Ababa</p>
          </div>
          <span className="ethiopia-hub-panel-live ml-auto">
            <span className="ethiopia-hub-panel-live-dot" aria-hidden />
            Live
          </span>
        </div>

        <ul className="ethiopia-hub-panel-stats">
          <li>
            <span className="ethiopia-hub-panel-stat-value">{COMMAND_STATS.products}+</span>
            <span className="ethiopia-hub-panel-stat-label">Products</span>
          </li>
          <li>
            <span className="ethiopia-hub-panel-stat-value">{COMMAND_STATS.countries}</span>
            <span className="ethiopia-hub-panel-stat-label">Countries</span>
          </li>
          <li>
            <span className="ethiopia-hub-panel-stat-value">${revenue.toLocaleString()}</span>
            <span className="ethiopia-hub-panel-stat-label">Revenue</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
