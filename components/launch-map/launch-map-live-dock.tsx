"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe2 } from "lucide-react";
import { useLaunchMap } from "@/components/launch-map/launch-map-provider";

export function LaunchMapLiveDock() {
  const { data, loading } = useLaunchMap();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  const events = data.events;
  const event = events[index % events.length];

  useEffect(() => {
    if (reduce || events.length === 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % events.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [events.length, reduce]);

  if (!event) return null;

  const isLive = data.source === "live" || data.source === "hybrid";

  return (
    <motion.div
      className="pointer-events-auto absolute inset-x-0 bottom-[4.5rem] z-30 mx-auto w-[min(100%,42rem)] px-4 sm:bottom-20"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div className="launch-map-dock overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {isLive ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              ) : null}
              <span
                className={`relative h-2 w-2 rounded-full ${isLive ? "bg-emerald-400" : "bg-amber-400"}`}
              />
            </span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              {isLive ? "Live launches" : "Platform preview"}
            </span>
            {loading ? (
              <span className="text-[0.6rem] text-white/40">Updating…</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-medium text-white/55">
            <span>{data.stats.launches} deploys</span>
            <span aria-hidden>·</span>
            <span>{data.stats.countries} countries</span>
            <span aria-hidden>·</span>
            <span>{data.stats.listings} listings</span>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={event.id}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.28 }}
              className="flex min-w-0 flex-1 items-start gap-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/8 text-lg">
                {event.icon}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{event.title}</p>
                <p className="mt-0.5 truncate text-sm text-[#ffb07a]">{event.detail}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <Link
            href="/explore/map"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            <Globe2 className="h-3.5 w-3.5" aria-hidden />
            Explore
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
