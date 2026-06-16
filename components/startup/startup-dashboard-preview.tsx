"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GeneratedStartupPayload } from "@/lib/startup/types";

type Props = {
  payload: GeneratedStartupPayload;
  startupId: string;
};

export function StartupDashboardPreview({ payload, startupId }: Props) {
  const accent = `hsl(${payload.brand.primaryHue} 70% 55%)`;

  const stats = [
    { label: "Active users", value: "1,248", delta: "+12%" },
    { label: "MRR", value: "$4.2k", delta: "+8%" },
    { label: "Conversion", value: "3.8%", delta: "+0.4%" },
    { label: "Churn", value: "1.2%", delta: "stable" },
  ];

  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100">
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-black/40 p-4 lg:block">
        <p className="text-sm font-bold" style={{ color: accent }}>
          {payload.name}
        </p>
        <p className="mt-1 text-[0.65rem] text-zinc-500">Dashboard preview</p>
        <nav className="mt-8 space-y-1 text-sm text-zinc-400">
          {["Overview", "Users", "Revenue", "Settings"].map((item, i) => (
            <div
              key={item}
              className={`rounded-lg px-3 py-2 ${i === 0 ? "bg-white/10 text-white" : ""}`}
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs text-zinc-500">Preview · not connected to live data</p>
            <h1 className="text-lg font-semibold">{payload.name} OS</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/startup/${startupId}`}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
            >
              Landing page
            </Link>
            <Link
              href="/app/builder"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
              style={{ background: accent }}
            >
              New startup
            </Link>
          </div>
        </header>

        <main className="flex flex-1 gap-4 p-4 sm:p-6">
          <motion.div
            className="min-w-0 flex-1 space-y-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">{s.label}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
                  <p className="mt-1 text-xs text-emerald-400">{s.delta}</p>
                </motion.div>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium">Growth · 7 days</p>
              <div className="mt-4 flex h-24 items-end gap-1">
                {[35, 48, 42, 58, 52, 70, 85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t opacity-90"
                    style={{ height: `${h}%`, background: accent }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-zinc-500">
              Full backend, auth, and billing ship in the platform roadmap — this preview shows
              what your generated SaaS could become.
            </div>
          </motion.div>

          <aside className="hidden w-72 shrink-0 flex-col rounded-xl border border-white/10 bg-white/5 p-4 xl:flex">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-500">
              AI assistant
            </p>
            <p className="mt-2 text-sm font-medium">Copilot</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Suggest pricing changes, draft onboarding emails, or analyze funnel drop-off.
            </p>
            <div className="mt-auto rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-500">
              Ask anything about {payload.name}…
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
