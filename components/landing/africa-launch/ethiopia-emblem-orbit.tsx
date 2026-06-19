"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EthiopiaFlagIcon } from "@/components/icons/ethiopia-flag-icon";

const ORBIT_STATS = [
  { label: "Live deploys", value: "12+" },
  { label: "Countries", value: "52" },
  { label: "From hub", value: "flag" as const },
] as const;

export function EthiopiaEmblemOrbit() {
  const reduce = useReducedMotion();

  return (
    <div className="ethio-emblem-orbit pointer-events-none absolute right-4 top-[22%] z-10 hidden sm:block md:right-8 lg:top-[24%]">
      <motion.div
        className="ethio-emblem-rays"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        aria-hidden
      />
      <motion.div
        className="ethio-emblem-ring"
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        aria-hidden
      />

      <motion.div
        className="ethio-emblem-core"
        initial={reduce ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <EthiopiaFlagIcon className="ethio-emblem-svg h-14 w-[5.25rem] rounded-md shadow-lg ring-1 ring-black/15" />
        </motion.div>
        <p className="ethio-emblem-caption">Origin · Ethiopia</p>
      </motion.div>

      <ul className="ethio-orbit-stats">
        {ORBIT_STATS.map((item, i) => (
          <motion.li
            key={item.label}
            initial={reduce ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
          >
            <span className="ethio-orbit-stats-value">
              {item.value === "flag" ? (
                <EthiopiaFlagIcon className="inline-block h-3.5 w-5 rounded-[2px] align-middle shadow-sm" />
              ) : (
                item.value
              )}
            </span>
            <span className="ethio-orbit-stats-label">{item.label}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
