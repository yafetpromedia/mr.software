"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LAUNCH_STORY } from "@/lib/landing/africa-hero-data";

type Props = {
  activeIndex: number;
  currentIcon: string;
  currentText: string;
};

export function LaunchTimeline({ activeIndex, currentIcon, currentText }: Props) {
  const reduce = useReducedMotion();
  const recent = LAUNCH_STORY.slice(Math.max(0, activeIndex - 2), activeIndex + 1);

  return (
    <div className="w-full max-w-md">
      <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF7A1A] opacity-50" />
          <span className="relative h-2 w-2 rounded-full bg-[#FF7A1A]" />
        </span>
        Software launch timeline
      </p>
      <div className="africa-stat-card space-y-2 p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentText}
            initial={reduce ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2.5 border-b border-white/[0.06] pb-2"
          >
            <span className="text-base">{currentIcon}</span>
            <p className="text-sm font-medium text-white">{currentText}</p>
          </motion.div>
        </AnimatePresence>
        <ul className="space-y-1.5">
          {recent.slice(0, -1).map((step) => (
            <li key={step.atMs} className="flex items-center gap-2 text-[11px] text-white/40">
              <span>{step.icon}</span>
              <span className="line-clamp-1">{step.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
