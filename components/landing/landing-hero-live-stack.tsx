"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { VerifiedBadge } from "@/components/storefront/verified-badge";

export type HeroFeaturedStore = {
  handle: string;
  name: string;
  tagline?: string;
  verified: boolean;
  productCount: number;
  followerCount: number;
  totalProductViews: number;
};

const SPARKLINE = [4, 7, 5, 9, 8, 12, 10, 14, 11, 16];

function Sparkline({ className = "" }: { className?: string }) {
  const max = Math.max(...SPARKLINE);
  const w = 56;
  const h = 24;
  const points = SPARKLINE.map((v, i) => {
    const x = (i / (SPARKLINE.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden>
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={w} cy={h - (SPARKLINE[SPARKLINE.length - 1]! / max) * h} r="2" fill="currentColor" />
    </svg>
  );
}

function ActivityShell({
  children,
  accent,
  index,
  reduce,
  highlight = false,
}: {
  children: React.ReactNode;
  accent: "accent" | "emerald" | "violet";
  index: number;
  reduce: boolean | null;
  highlight?: boolean;
}) {
  const stripe =
    accent === "emerald"
      ? "from-emerald-500 to-teal-400"
      : accent === "violet"
        ? "from-violet-500 to-purple-400"
        : "from-[var(--accent)] to-orange-400";

  return (
    <motion.div
      className={`hero-activity-item group relative overflow-hidden rounded-xl border p-3.5 ${
        highlight
          ? "border-emerald-500/25 bg-emerald-500/[0.04]"
          : "border-[var(--border)]"
      }`}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <span
        className={`absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b ${stripe}`}
        aria-hidden
      />
      {children}
    </motion.div>
  );
}

function LiveFeedHeader() {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-2 px-0.5">
      <div>
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--foreground)]">
          Activity
        </p>
        <p className="mt-0.5 text-[0.6rem] text-[var(--muted)]">Real platform events</p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[0.55rem] font-bold text-emerald-700 dark:text-emerald-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        Live
      </span>
    </div>
  );
}

export function LandingHeroLiveStack({
  store,
  layout = "vertical",
}: {
  store: HeroFeaturedStore;
  layout?: "vertical" | "horizontal";
}) {
  const reduce = useReducedMotion();
  const wrap =
    layout === "horizontal"
      ? "grid gap-3 sm:grid-cols-3"
      : "flex flex-col gap-2.5";

  const content = (
    <>
      <ActivityShell accent="accent" index={0} reduce={reduce}>
        <Link href={`/@${store.handle}`} className="block">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[0.58rem] font-bold uppercase tracking-wider text-[var(--muted)]">
              Storefront
            </p>
            <span className="rounded-md bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[0.55rem] font-semibold tabular-nums text-[var(--muted)]">
              {store.productCount} products
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-muted)] to-[var(--surface-elevated)] text-sm font-bold text-[var(--accent)] ring-1 ring-[var(--border)]">
              {store.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-[var(--foreground)]">{store.name}</p>
                {store.verified ? <VerifiedBadge size="sm" /> : null}
              </div>
              <p className="font-mono text-[0.65rem] text-[var(--muted)]">@{store.handle}</p>
            </div>
          </div>
          <p className="mt-2.5 text-[0.65rem] font-medium text-[var(--muted)]">
            {store.productCount} product{store.productCount === 1 ? "" : "s"}
            {store.followerCount > 0 ? ` · ${store.followerCount} followers` : ""}
          </p>
        </Link>
      </ActivityShell>

      <ActivityShell accent="emerald" index={1} reduce={reduce} highlight>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[0.58rem] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            New sale
          </p>
          <span className="text-[0.55rem] font-medium text-[var(--muted)]">2m ago</span>
        </div>
        <p className="mt-2 text-sm font-bold text-[var(--foreground)]">Dashboard UI Kit</p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="text-base font-bold tabular-nums text-[var(--foreground)]">ETB 2,450</p>
          <span className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[0.55rem] font-semibold text-[var(--muted)]">
            via Chapa
          </span>
        </div>
      </ActivityShell>

      <ActivityShell accent="violet" index={2} reduce={reduce}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[0.58rem] font-bold uppercase tracking-wider text-[var(--muted)]">
            Deployment
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.55rem] font-bold text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Healthy
          </span>
        </div>
        <p className="mt-2 truncate font-mono text-xs font-medium text-[var(--foreground)]">
          tracker.mr.software
        </p>
        <div className="mt-2.5 flex items-end justify-between gap-2">
          <p className="text-[0.65rem] text-[var(--muted)]">Edge · SSL · 42ms</p>
          <Sparkline className="h-6 w-14 text-emerald-500" />
        </div>
      </ActivityShell>
    </>
  );

  if (layout === "horizontal") {
    return (
      <div className="hero-activity-panel rounded-2xl p-4 sm:p-5">
        <LiveFeedHeader />
        <div className={wrap}>{content}</div>
      </div>
    );
  }

  return (
    <div className="hero-activity-panel rounded-2xl p-4">
      <LiveFeedHeader />
      <div className={wrap}>{content}</div>
    </div>
  );
}
