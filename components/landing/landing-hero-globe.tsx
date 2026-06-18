"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Rocket } from "lucide-react";

const GLOBE_DOTS = (() => {
  const dots: { cx: number; cy: number; r: number; o: number }[] = [];
  const rings = 18;
  for (let ri = 0; ri < rings; ri++) {
    const lat = (ri / (rings - 1)) * Math.PI;
    const y = 50 + Math.cos(lat) * 46;
    const ringR = Math.sin(lat) * 46;
    const count = Math.max(5, Math.round(ringR * 1.25));
    for (let i = 0; i < count; i++) {
      const lon = (i / count) * Math.PI * 2;
      const x = 50 + Math.cos(lon) * ringR;
      const depth = Math.sin(lat) * Math.abs(Math.cos(lon));
      dots.push({ cx: x, cy: y, r: 0.6 + depth * 0.4, o: 0.2 + depth * 0.6 });
    }
  }
  return dots;
})();

type Props = {
  reduceMotion: boolean;
};

export function LandingHeroGlobe({ reduceMotion }: Props) {
  return (
    <div className="pointer-events-none relative h-full w-full overflow-hidden">
      {/* Bottom horizon — top of globe visible, ~32% cropped below */}
      <div className="absolute bottom-0 left-1/2 h-[min(1280px,170vmin)] w-[min(1280px,170vmin)] -translate-x-1/2 translate-y-[32%]">
        <div
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_18%,rgba(255,120,40,0.22),transparent_55%)] blur-3xl"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_16%,rgba(255,160,80,0.16),rgba(12,8,5,0.94)_54%,rgba(0,0,0,1)_74%)]"
          aria-hidden
        />

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <clipPath id="hemisphere">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
            <radialGradient id="africaGlow" cx="50%" cy="58%" r="18%">
              <stop offset="0%" stopColor="rgba(255,140,50,0.55)" />
              <stop offset="100%" stopColor="rgba(255,140,50,0)" />
            </radialGradient>
          </defs>
          <g clipPath="url(#hemisphere)">
            <circle cx="50" cy="58" r="14" fill="url(#africaGlow)" />
            {GLOBE_DOTS.map((d, i) => (
              <circle
                key={i}
                cx={d.cx}
                cy={d.cy}
                r={d.r}
                fill={`rgba(255,170,100,${d.o})`}
              />
            ))}
          </g>
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(255,180,120,0.14)"
            strokeWidth="0.35"
          />
        </svg>

        <motion.div
          className="absolute inset-[6%] rounded-[100%] border border-orange-400/10"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />

        <svg
          className="absolute inset-0 h-full w-full opacity-55"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" />
            </filter>
            <linearGradient id="softArc" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,150,60,0)" />
              <stop offset="40%" stopColor="rgba(255,150,60,0.35)" />
              <stop offset="100%" stopColor="rgba(255,200,140,0.12)" />
            </linearGradient>
          </defs>
          <g filter="url(#softGlow)" stroke="url(#softArc)" strokeWidth="0.35" fill="none" strokeLinecap="round">
            <path d="M50 62 C58 56, 72 48, 84 42" />
            <path d="M50 62 C42 56, 28 48, 16 42" />
          </g>
        </svg>

        <div
          className="absolute left-1/2 top-[58%] z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300 shadow-[0_0_24px_rgba(255,160,60,0.9)]"
          aria-hidden
        />
        {!reduceMotion ? (
          <motion.div
            className="absolute left-1/2 top-[58%] z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/20 blur-md"
            animate={{ scale: [1, 1.7, 1], opacity: [0.45, 0.12, 0.45] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        ) : null}
      </div>

      <div className="pointer-events-auto absolute bottom-6 right-[max(1rem,calc(50%-34rem))] z-20 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-xs text-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:w-[230px]">
        <p className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/15">
            <Rocket className="h-3.5 w-3.5 text-orange-400" />
          </span>
          <span className="leading-snug">
            <span className="font-medium text-white">New SaaS Sold</span>
            <br />
            <span className="text-white/50">Mr.Commerce → global marketplace</span>
          </span>
        </p>
      </div>
    </div>
  );
}
