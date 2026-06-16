"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GenerationLoading } from "@/components/startup/generation-loading";
import { StartupLanding } from "@/components/startup/startup-landing";
import type { GeneratedStartupPayload } from "@/lib/startup/types";

type SavedStartup = {
  id: string;
  idea: string;
  payload: GeneratedStartupPayload;
};

type ListItem = {
  id: string;
  idea: string;
  name: string;
  tagline: string;
  createdAt: string;
};

type BuilderMode = "beginner" | "developer";

export function StartupBuilder() {
  const router = useRouter();
  const [mode, setMode] = useState<BuilderMode>("beginner");
  const [idea, setIdea] = useState("I want a fitness tracker SaaS");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SavedStartup | null>(null);
  const [recent, setRecent] = useState<ListItem[]>([]);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/startups", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as { startups: ListItem[] };
      setRecent(data.startups);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    setLoadingStep(0);
    setPreview(null);

    const stepInterval = window.setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 4));
    }, 700);

    try {
      const res = await fetch("/api/generate-startup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, save: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Generation failed");
        return;
      }
      const startup = data.startup as SavedStartup;
      setPreview(startup);
      void loadRecent();
    } catch {
      setError("Network error. Try again.");
    } finally {
      window.clearInterval(stepInterval);
      setLoading(false);
    }
  }

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          AI-assisted builder
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Build with AI guidance and full control
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          AI suggests structure, UI drafts, and architecture â€” you review, edit, export, and choose
          where to deploy. Not full automation; real builder ownership.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Builder mode">
        {(
          [
            { id: "beginner" as const, label: "Beginner mode", hint: "Guided drafts & AI assist" },
            { id: "developer" as const, label: "Developer mode", hint: "Code export & hosting freedom" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-xl border px-4 py-2.5 text-left transition ${
              mode === m.id
                ? "border-[var(--accent)]/50 bg-[var(--accent-muted)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/25"
            }`}
          >
            <span className="block text-sm font-semibold">{m.label}</span>
            <span className="mt-0.5 block text-[0.65rem] text-[var(--muted)]">{m.hint}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="glass-panel space-y-4 rounded-2xl p-5 sm:p-6">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Describe your startup idea
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="e.g. AI-powered fitness tracker for busy professionalsâ€¦"
          />
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading || idea.trim().length < 3}
            className="btn-brand inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-50 sm:w-auto sm:min-w-[12rem] sm:px-8"
          >
            {loading ? "Drafting suggestionsâ€¦" : "Get AI draft"}
          </button>

          <p className="text-[0.65rem] leading-relaxed text-[var(--muted)]">
            Drafts are starting points. Edit before sharing or deploying.{" "}
            {mode === "developer"
              ? "Developer mode: export ZIP, GitHub, and external hosts (Hostinger, VPS, custom) coming soon."
              : "Beginner mode: guided UI with lighter technical exposure."}
          </p>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Deployment (your choice)
            </p>
            <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
              <li>Â· Mr.Software Cloud â€” coming</li>
              <li>Â· External: VPS, Hostinger, custom server</li>
              <li>Â· Marketplace listing or self-hosted monetization</li>
            </ul>
          </div>

          {recent.length > 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Your creations
              </p>
              <ul className="mt-3 space-y-2">
                {recent.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/startup/${s.id}`)}
                      className="w-full rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-left text-sm transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-muted)]"
                    >
                      <span className="font-medium text-[var(--foreground)]">{s.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">
                        {s.idea}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="min-h-[28rem]">
          <AnimatePresence mode="wait">
            {loading ? (
              <GenerationLoading key="load" step={loadingStep} />
            ) : preview ? (
              <motion.div
                key={preview.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/startup/${preview.id}`}
                    className="btn-brand inline-flex h-9 items-center rounded-lg px-4 text-xs font-semibold"
                  >
                    Open landing page â†’
                  </Link>
                  <Link
                    href={`/startup/${preview.id}/dashboard-preview`}
                    className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-medium transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-muted)]"
                  >
                    Dashboard preview
                  </Link>
                </div>
                <div className="ai-glow-ring overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl shadow-[var(--accent-glow)]">
                  <div className="max-h-[32rem] overflow-y-auto">
                    <StartupLanding
                      payload={preview.payload}
                      startupId={preview.id}
                      showBuiltWith={false}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <div
                key="empty"
                className="flex h-full min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--accent)]/20 bg-[var(--accent-muted)]/30 p-8 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-xl text-[var(--accent)]">
                  âœ¦
                </span>
                <p className="mt-4 text-sm font-medium text-[var(--foreground)]">Draft preview</p>
                <p className="mt-2 max-w-xs text-xs text-[var(--muted)]">
                  AI-suggested landing draft appears here for review â€” not final production output.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
