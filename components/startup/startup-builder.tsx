"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Cloud,
  Code2,
  LayoutTemplate,
  Rocket,
  Server,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
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

const MODES = [
  {
    id: "beginner" as const,
    label: "Beginner",
    hint: "Guided drafts & AI assist",
    icon: Wand2,
  },
  {
    id: "developer" as const,
    label: "Developer",
    hint: "Code export & hosting freedom",
    icon: Code2,
  },
] as const;

const DEPLOY_OPTIONS = [
  { icon: Cloud, label: "Mr.Software Cloud", status: "Live", href: "/deploy?source=zip" },
  { icon: Server, label: "VPS, Hostinger, custom server", status: "Supported" },
  { icon: Rocket, label: "Marketplace or self-hosted", status: "Supported" },
] as const;

function DraftPreviewEmpty() {
  return (
    <div className="relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] sm:min-h-[26rem]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-elevated)]/80 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-1 font-mono text-[0.65rem] text-[var(--muted)]">preview.mr.software</span>
      </div>

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--accent-muted),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex w-full max-w-xs flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-muted)] text-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)]">
            <LayoutTemplate className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">Draft preview</p>
          <p className="mt-1.5 max-w-[16rem] text-xs leading-relaxed text-[var(--muted)]">
            Your AI-suggested landing draft will appear here for review before you ship.
          </p>
        </div>

        <div className="relative mt-8 space-y-3" aria-hidden>
          {[72, 48, 88].map((w, i) => (
            <motion.div
              key={i}
              className="h-3 rounded-full bg-[var(--border-subtle)]"
              style={{ width: `${w}%` }}
              animate={{ opacity: [0.45, 0.85, 0.45] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-16 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/60"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 + i * 0.15 }}
              />
            ))}
          </div>
          <motion.div
            className="h-9 w-28 rounded-full bg-[var(--accent-muted)]"
            animate={{ opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}

export function StartupBuilder() {
  const router = useRouter();
  const [mode, setMode] = useState<BuilderMode>("beginner");
  const [idea, setIdea] = useState("I want a fitness tracker SaaS");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SavedStartup | null>(null);
  const [recent, setRecent] = useState<ListItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDeleteCreation(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/startups/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not delete creation");
        return;
      }
      setRecent((prev) => prev.filter((s) => s.id !== id));
      if (preview?.id === id) setPreview(null);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <motion.div
      className="mx-auto max-w-6xl space-y-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)]/10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            AI-assisted builder
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-[2rem]">
            Build with AI guidance and full control
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
            Every draft is generated by Mr.Software AI from your prompt — copy, visuals, layout, and
            structure. Review and edit before you ship.
          </p>
        </div>
      </div>

      {/* Mode switcher */}
      <div
        className="inline-flex w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/80 p-1.5 shadow-sm sm:w-auto"
        role="tablist"
        aria-label="Builder mode"
      >
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(m.id)}
              className={`relative flex flex-1 items-center gap-2.5 rounded-xl px-4 py-2.5 text-left transition-colors sm:flex-initial sm:px-5 ${
                active ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId="builder-mode-pill"
                  className="absolute inset-0 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-muted)] shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
              <Icon className="relative h-4 w-4 shrink-0" aria-hidden />
              <span className="relative min-w-0">
                <span className="block text-sm font-semibold">{m.label}</span>
                <span className="mt-0.5 hidden text-[0.65rem] text-[var(--muted)] sm:block">{m.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Input panel */}
        <div className="modern-card space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="startup-idea" className="text-sm font-semibold text-[var(--foreground)]">
              Describe your startup idea
            </label>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Be specific — audience, problem, visuals (e.g. images, 3D), and what you want to sell.
            </p>
          </div>

          <div className="relative">
            <textarea
              id="startup-idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm leading-relaxed text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="e.g. Modern fitness tracker SaaS with hero images and 3D visual elements…"
            />
            <span className="pointer-events-none absolute bottom-3 right-3 text-[0.65rem] tabular-nums text-[var(--muted)]">
              {idea.length}
            </span>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-500/25 bg-red-500/8 px-3 py-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading || idea.trim().length < 3}
            className="btn-brand btn-brand-shine group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-50 sm:w-auto sm:min-w-[13rem] sm:px-8"
          >
            {loading ? (
              "Drafting suggestions…"
            ) : (
              <>
                Get AI draft
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </>
            )}
          </button>

          <p className="text-[0.7rem] leading-relaxed text-[var(--muted)]">
            Drafts are starting points — edit before sharing or deploying.{" "}
            {mode === "developer"
              ? "Developer mode: export ZIP, GitHub, and external hosts coming soon."
              : "Beginner mode: guided UI with lighter technical exposure."}
          </p>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Deployment options
            </p>
            <ul className="mt-3 space-y-2.5">
              {DEPLOY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isLive = opt.status === "Live";
                const row = (
                  <>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 text-[var(--foreground)]">{opt.label}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${
                        isLive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : opt.status === "Coming soon"
                            ? "bg-[var(--surface-elevated)] text-[var(--muted)]"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {opt.status}
                    </span>
                  </>
                );
                return (
                  <li key={opt.label}>
                    {"href" in opt && opt.href ? (
                      <Link
                        href={opt.href}
                        className="flex items-center gap-3 rounded-lg border border-transparent px-1 py-0.5 text-xs transition hover:border-[var(--border)] hover:bg-[var(--surface)]"
                      >
                        {row}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 text-xs">{row}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {recent.length > 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Your creations
              </p>
              <ul className="mt-3 space-y-1.5">
                {recent.map((s) => (
                  <li key={s.id}>
                    <div className="group flex items-stretch gap-1 rounded-xl border border-transparent transition hover:border-[var(--border)] hover:bg-[var(--surface)]">
                      <button
                        type="button"
                        onClick={() => router.push(`/startup/${s.id}`)}
                        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-sm font-bold text-[var(--accent)]">
                          {s.name.charAt(0)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[var(--foreground)]">
                            {s.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">{s.idea}</span>
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-[var(--muted)] opacity-0 transition group-hover:opacity-100"
                          aria-hidden
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteCreation(s.id)}
                        disabled={deletingId === s.id}
                        className="shrink-0 self-center rounded-lg p-2 text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                        aria-label={`Delete ${s.name}`}
                        title="Delete creation"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Preview panel */}
        <div className="min-h-[22rem] sm:min-h-[26rem]">
          <AnimatePresence mode="wait">
            {loading ? (
              <GenerationLoading key="load" step={loadingStep} />
            ) : preview ? (
              <motion.div
                key={preview.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/startup/${preview.id}`}
                    className="btn-brand inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-semibold"
                  >
                    Open landing page
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <Link
                    href={`/startup/${preview.id}/dashboard-preview`}
                    className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-medium transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-muted)]"
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
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DraftPreviewEmpty />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
