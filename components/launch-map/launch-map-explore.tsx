"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Globe2, Rocket, ShoppingBag, Sparkles } from "lucide-react";
import { AfricaGlobeCanvas } from "@/components/landing/africa-launch/africa-globe-canvas";
import { LaunchMapProvider, useLaunchMap } from "@/components/launch-map/launch-map-provider";
import { BRAND_NAME } from "@/lib/branding/constants";
import type { LaunchMapEventType, LaunchMapPayload } from "@/lib/launch-map/types";

type Filter = "all" | LaunchMapEventType;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All activity" },
  { id: "deploy", label: "Deployments" },
  { id: "listing", label: "Listings" },
  { id: "sale", label: "Sales" },
];

function typeIcon(type: LaunchMapEventType) {
  if (type === "deploy") return Rocket;
  if (type === "listing") return ShoppingBag;
  return Sparkles;
}

function LaunchMapExploreInner() {
  const { data, loading } = useLaunchMap();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("all");

  const points = useMemo(() => {
    if (filter === "all") return data.points;
    return data.points.filter((p) => p.type === filter);
  }, [data.points, filter]);

  const isLive = data.source === "live" || data.source === "hybrid";

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[var(--background)]">
      <div className="relative overflow-hidden border-b border-[var(--border)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% -10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Home
          </Link>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                <Globe2 className="h-3.5 w-3.5" aria-hidden />
                Global infrastructure map
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Live launches worldwide
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                Real deployments, marketplace listings, and sales from {BRAND_NAME} builders —
                updated live every 30 seconds.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatPill label="Deploys" value={data.stats.launches} />
              <StatPill label="Listings" value={data.stats.listings} />
              <StatPill label="Countries" value={data.stats.countries} />
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  isLive
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
                {data.source === "live" ? "Live data" : data.source === "hybrid" ? "Live + preview" : "Demo mode"}
                {loading ? " · syncing" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              3D globe · arc view
            </p>
          </div>
          <div className="relative aspect-square min-h-[18rem] overflow-hidden bg-[#050508] sm:min-h-[22rem] lg:min-h-[24rem]">
            <AfricaGlobeCanvas
              className="absolute inset-0 h-full w-full"
              variant="embedded"
              reduceMotion={!!reduce}
              isLight={false}
              introComplete
              deploymentArcs={data.arcs}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#050508] to-transparent" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === f.id
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)]/30"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {points.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
                No events in this category yet. Be the first —{" "}
                <Link href="/app/factory" className="font-medium text-[var(--accent)] hover:underline">
                  start the Startup Factory
                </Link>
                .
              </li>
            ) : (
              points.map((point, i) => {
                const Icon = typeIcon(point.type);
                return (
                  <motion.li
                    key={point.id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/25 hover:shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[var(--foreground)]">{point.productName}</p>
                          <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                            {point.type}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {point.originFlag} {point.originCity} → {point.flag} {point.city}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                          <span>{point.relativeTime}</span>
                          {point.handle ? (
                            <Link
                              href={`/@${point.handle}`}
                              className="inline-flex items-center gap-0.5 font-medium text-[var(--accent)] hover:underline"
                            >
                              @{point.handle}
                              <ArrowUpRight className="h-3 w-3" aria-hidden />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })
            )}
          </ul>

          <Link
            href="/app/factory"
            className="btn-brand flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold"
          >
            Launch your product on the map
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-center">
      <p className="text-lg font-semibold tabular-nums text-[var(--foreground)]">{value}</p>
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--muted)]">{label}</p>
    </div>
  );
}

export function LaunchMapExplore({ initialLaunchMap }: { initialLaunchMap: LaunchMapPayload }) {
  return (
    <LaunchMapProvider initial={initialLaunchMap}>
      <LaunchMapExploreInner />
    </LaunchMapProvider>
  );
}
