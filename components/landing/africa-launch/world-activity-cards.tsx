"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { WORLD_ACTIVITIES } from "@/lib/landing/africa-hero-data";

type Props = {
  litCountries: number;
};

export function WorldActivityCards({ litCountries }: Props) {
  const reduce = useReducedMotion();
  const visible = WORLD_ACTIVITIES.filter((a) => litCountries >= a.unlockAtCountryIndex);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 hidden sm:block" aria-hidden>
      <AnimatePresence>
        {visible.map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={reduce ? false : { opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`africa-activity-card absolute ${activity.position}`}
          >
            <p className="text-sm leading-none">{activity.flag}</p>
            <p className="mt-1 text-[11px] font-semibold text-white">{activity.country}</p>
            <p className="mt-0.5 text-[10px] text-orange-200/80">{activity.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
