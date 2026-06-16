"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Tab = "deployments" | "projects" | "marketplace" | "analytics";

const tabs: { id: Tab; label: string }[] = [
  { id: "deployments", label: "Deployments" },
  { id: "projects", label: "Projects" },
  { id: "marketplace", label: "Marketplace" },
  { id: "analytics", label: "Analytics" },
];

/**
 * In-device canvas: slate greys (no true black); accents use `var(--accent)`.
 * Stops stay in 800/900 so it reads as “product UI” not an OLED void.
 */
const screenSurface =
  "bg-gradient-to-b from-slate-800/96 via-slate-900/98 to-slate-900";
const line = "border-slate-700/50";
const soft = "text-slate-500";
const textMain = "text-slate-100";

function DeploymentsContent() {
  const rows = [
    { name: "api-dashboard", status: "ACTIVE" as const, url: "project.mrsoftware.app" },
    { name: "docs-site", status: "ACTIVE" as const, url: "docs-site--acme.mrsoftware.app" },
    { name: "status-page", status: "PENDING" as const, url: "—" },
  ];
  return (
    <div className="p-3 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-tight text-slate-500">All projects</span>
        <span
          className={`rounded-full border ${line} bg-slate-800/50 px-2.5 py-1 text-[0.6rem] font-mono text-slate-500`}
        >
          org / production
        </span>
      </div>
      <div
        className={`overflow-hidden rounded-2xl border ${line} bg-slate-800/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]`}
      >
        <div className="grid grid-cols-[minmax(0,1.1fr)_100px_minmax(0,1.2fr)] gap-0 text-[0.7rem] sm:text-[0.75rem]">
          <div
            className={`col-span-3 grid grid-cols-subgrid border-b ${line} bg-slate-800/30 px-3 py-2.5 text-[0.6rem] font-semibold uppercase tracking-wider sm:px-4`}
          >
            <span className={soft}>Name</span>
            <span className={soft}>Status</span>
            <span className={soft}>URL</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.name}
              className={`col-span-3 grid grid-cols-subgrid border-b ${line} px-3 py-3 transition-colors last:border-0 hover:bg-[var(--accent-muted)] sm:px-4 ${
                i % 2 === 0 ? "bg-transparent" : "bg-slate-800/15"
              }`}
            >
              <span className={`font-mono text-[0.7rem] font-medium sm:text-[0.75rem] ${textMain}`}>
                {r.name}
              </span>
              <div className="flex items-center">
                <span
                  className={
                    r.status === "ACTIVE"
                      ? "inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] font-semibold leading-none text-emerald-400"
                      : "inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[0.6rem] font-semibold leading-none text-amber-300"
                  }
                >
                  <span
                    className={`h-1 w-1 rounded-full ${
                      r.status === "ACTIVE" ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                    aria-hidden
                  />
                  {r.status}
                </span>
              </div>
              <span
                className="truncate font-mono text-[0.65rem] text-[var(--accent)] sm:text-[0.7rem]"
                title={r.url}
              >
                {r.url}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsContent() {
  const cards = [
    { n: "Marketing site", desc: "Next.js · main", tag: "Default" },
    { n: "Admin console", desc: "React · internal", tag: "Team" },
  ];
  return (
    <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-5">
      {cards.map((c) => (
        <motion.div
          key={c.n}
          className={`group cursor-default rounded-2xl border ${line} bg-gradient-to-b from-slate-800/85 to-slate-900/75 p-4 transition-all hover:border-[var(--accent)]/30 hover:shadow-[0_0_0_1px_rgba(234,88,12,0.12)]`}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-slate-100">{c.n}</p>
            <span className="rounded-md border border-slate-600/50 bg-slate-800/50 px-1.5 py-0.5 text-[0.6rem] text-slate-400">
              {c.tag}
            </span>
          </div>
            <p className="mt-1 text-[0.7rem] text-slate-500">{c.desc}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[var(--accent)] to-orange-300/90" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AnalyticsContent() {
  const metrics = [
    { label: "Requests", value: "2.4M", delta: "+12%" },
    { label: "Revenue", value: "$48.2k", delta: "+8%" },
    { label: "Active users", value: "12.8k", delta: "+5%" },
    { label: "Deploy success", value: "99.2%", delta: "stable" },
  ];
  return (
    <div className="p-3 sm:p-5">
      <div className="grid gap-2 sm:grid-cols-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`rounded-xl border ${line} bg-slate-800/30 px-3 py-3`}
          >
            <p className="text-[0.65rem] uppercase tracking-wider text-slate-500">{m.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">{m.value}</p>
            <p className="text-[0.65rem] text-emerald-400">{m.delta}</p>
          </div>
        ))}
      </div>
      <div className={`mt-3 rounded-xl border ${line} bg-slate-800/25 p-3`}>
        <p className="text-[0.65rem] font-medium text-slate-500">Traffic · 7d</p>
        <div className="mt-3 flex h-16 items-end gap-1">
          {[40, 55, 48, 72, 65, 80, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-[var(--accent)]/60 to-[var(--accent)]/20"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketplaceContent() {
  const items = [
    { n: "ShipKit Pro", p: "$29", sub: "ONE_TIME" },
    { n: "Observability stack", p: "$49/mo", sub: "SUB" },
    { n: "Starter template", p: "Free", sub: "FREE" },
  ];
  return (
    <div className="space-y-2 p-3 sm:p-5">
      <div
        className={`mb-1 flex items-center gap-2 rounded-xl border ${line} bg-slate-800/45 px-3 py-2.5 text-[0.75rem] text-slate-500`}
      >
        <span className="text-[var(--accent)]">⌕</span>
        <span>Search listings…</span>
      </div>
      {items.map((c) => (
        <div
          key={c.n}
          className={`flex items-center justify-between gap-3 rounded-2xl border ${line} bg-slate-800/25 px-3 py-3 transition-colors hover:border-[var(--accent)]/25 hover:bg-slate-800/40`}
        >
          <div>
            <p className="text-sm font-medium text-slate-100">{c.n}</p>
            <p className="text-[0.65rem] text-slate-500">{c.sub}</p>
          </div>
          <span className="text-sm font-semibold text-[var(--accent)]">{c.p}</span>
        </div>
      ))}
    </div>
  );
}

type DeviceFrameProps = { children: ReactNode };

/** Landscape tablet (iPad-style): even bezel, glass display, no laptop base. */
function DeviceFrame({ children }: DeviceFrameProps) {
  return (
    <div
      className="mx-auto w-full max-w-7xl [perspective:2000px]"
      style={{ perspectiveOrigin: "50% 50%" }}
    >
      <div
        className="transform-gpu will-change-transform transition-transform duration-500 [transform:rotateX(3deg)] motion-reduce:[transform:rotateX(0deg)] sm:[transform:rotateX(2deg)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-4 rounded-[2.75rem] bg-gradient-to-b from-[var(--accent)]/14 via-amber-500/8 to-orange-500/5 blur-3xl sm:-inset-8"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-6 left-1/2 h-8 w-4/5 max-w-xl -translate-x-1/2 rounded-[100%] bg-slate-900/20 blur-2xl dark:bg-slate-950/50"
            aria-hidden
          />
          <div
            className="relative rounded-[1.6rem] border border-zinc-300/50 bg-gradient-to-b from-zinc-200/99 via-zinc-300/97 to-zinc-400/92 p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.5)_inset,0_2px_4px_rgba(0,0,0,0.05),0_24px_48px_-12px_rgba(0,0,0,0.3),0_0_0_0.5px_rgba(0,0,0,0.06)] sm:rounded-[2rem] sm:p-3 dark:border-zinc-600/45 dark:from-zinc-600/95 dark:via-zinc-700/98 dark:to-zinc-800/95"
          >
            <div
              className="flex w-full items-center justify-center py-1.5 sm:py-2"
              aria-hidden
            >
              <div className="h-1 w-1 rounded-full bg-zinc-500/90 shadow-sm dark:bg-zinc-500/50" />
              <div className="mx-2 h-1.5 w-6 rounded-full bg-zinc-500/20 ring-1 ring-zinc-500/25 dark:bg-zinc-900/50 dark:ring-zinc-700/40" />
            </div>
            <div
              className="relative overflow-hidden rounded-2xl border border-slate-700/45 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_-4px_rgba(0,0,0,0.3)] sm:rounded-3xl"
            >
              <div
                className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent"
                aria-hidden
              />
              <div className={`relative z-0 min-h-0 ${screenSurface}`}>
                <div
                  className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(234,88,12,0.11),transparent_58%)]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(249,115,22,0.08),transparent_50%)]"
                  aria-hidden
                />
                <div className="relative z-[2] min-h-0">{children}</div>
              </div>
            </div>
            <div className="flex justify-center pb-1.5 pt-2 sm:pb-2 sm:pt-2.5" aria-hidden>
              <div className="h-1 w-10 rounded-full bg-zinc-500/25 shadow-inner sm:w-12 dark:bg-zinc-300/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformPreview() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>("deployments");
  const [loading, setLoading] = useState(false);

  const runLoad = useCallback(
    (next: Tab) => {
      if (next === tab) return;
      setLoading(true);
      window.setTimeout(() => {
        setTab(next);
        window.setTimeout(() => setLoading(false), reduce ? 0 : 240);
      }, reduce ? 0 : 160);
    },
    [tab, reduce],
  );

  return (
    <section className="relative border-b border-[var(--border)] py-20 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(234,88,12,0.09),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_30%,rgba(251,146,60,0.07),transparent_50%)]"
        aria-hidden
      />
      <div
        className="bg-noise pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply dark:opacity-20"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,90rem)] px-3 sm:px-5">
        <motion.div
          className="mx-auto max-w-2xl px-2 text-center sm:px-0"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Live system preview
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl">
            Production infrastructure UI — deployments to analytics
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            Deployments, marketplace, analytics, and AI copilots—same auth, same data model,
            built for scale.
          </p>
        </motion.div>

        <motion.div
          className="relative mt-12 sm:mt-16"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
        >
          <DeviceFrame>
            <div className="flex min-h-0 flex-col">
              <div
                className={`flex flex-wrap items-center gap-2 border-b ${line} bg-slate-800/30 px-3 py-2.5 backdrop-blur-sm sm:px-4`}
              >
                <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-slate-600/40 bg-slate-800/50 ring-1 ring-white/[0.06] sm:h-9 sm:w-9">
                    <Image
                      src="/brand/logo-mark.png"
                      alt=""
                      width={36}
                      height={36}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  <div>
                    <p className="text-[0.72rem] font-semibold text-slate-200 sm:text-xs">Mr.Software</p>
                    <p className="text-[0.6rem] text-slate-500">Workspace</p>
                  </div>
                </div>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-1 sm:gap-1.5">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => runLoad(t.id)}
                      className={
                        tab === t.id
                          ? `relative rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-muted)] px-3 py-1.5 text-[0.7rem] font-semibold text-amber-100 shadow-[0_0_24px_-4px_rgba(234,88,12,0.35)] sm:px-3.5 sm:py-2 sm:text-xs`
                          : "rounded-lg px-3 py-1.5 text-[0.7rem] font-medium text-slate-500 transition-colors hover:bg-slate-800/80 hover:text-slate-200 sm:py-2 sm:text-xs"
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[min(60vh,440px)] sm:min-h-[460px]">
                {loading ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                  </div>
                ) : null}
                <motion.div
                  key={tab}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: loading ? 0.45 : 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {tab === "deployments" ? <DeploymentsContent /> : null}
                  {tab === "projects" ? <ProjectsContent /> : null}
                  {tab === "marketplace" ? <MarketplaceContent /> : null}
                  {tab === "analytics" ? <AnalyticsContent /> : null}
                </motion.div>
              </div>
            </div>
          </DeviceFrame>
        </motion.div>

        <p className="mt-10 text-center text-sm text-[var(--muted)] sm:mt-12">
          <Link
            href="/auth/register"
            className="font-semibold text-[var(--foreground)] underline-offset-4 hover:text-[var(--accent)]"
          >
            Open the full workspace
          </Link>{" "}
          with your account.
        </p>
      </div>
    </section>
  );
}
