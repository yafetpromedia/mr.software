"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { LIVE_EVENTS } from "@/lib/landing/africa-hero-data";
import { useLaunchMapOptional } from "@/components/launch-map/launch-map-provider";

export function LiveEventsFeed() {
  const reduce = useReducedMotion();
  const launchMap = useLaunchMapOptional();
  const events = launchMap?.data.events ?? LIVE_EVENTS;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % events.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [reduce, events.length]);

  const event = events[index % events.length]!;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 [data-theme='light']:text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
          Live marketplace
        </p>
      </div>
      <div className="africa-stat-card min-h-[4.75rem] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={event.id}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-base">
              {event.icon}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{event.title}</p>
              <p className="mt-0.5 truncate text-sm text-[#ffb07a]">{event.detail}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
