"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Database,
  Layers,
  Rocket,
  Save,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { GenerationLoading } from "@/components/startup/generation-loading";
import type { StartupAdvisorAnalysis } from "@/lib/ai/schema";

type AdvisorResponse = StartupAdvisorAnalysis & { source?: "ai" };

type ConversationListItem = {
  id: string;
  title: string;
  createdAt: string;
};

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Brain;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function StartupAdvisorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [idea, setIdea] = useState("I want to build a school management SaaS");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AdvisorResponse | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [recent, setRecent] = useState<ConversationListItem[]>([]);
  const [savingLaunch, setSavingLaunch] = useState(false);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/conversations?product=STARTUP_ADVISOR", {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { conversations: ConversationListItem[] };
      setRecent(data.conversations);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  useEffect(() => {
    const fromQuery = searchParams.get("idea")?.trim();
    if (fromQuery) setIdea(fromQuery);
  }, [searchParams]);

  async function handleAnalyze() {
    setError(null);
    setLoading(true);
    setLoadingStep(0);
    setAnalysis(null);

    const stepInterval = window.setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 4));
    }, 900);

    try {
      const res = await fetch("/api/ai/startup-advisor", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, save: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Analysis failed");
        return;
      }
      setAnalysis(data.analysis as AdvisorResponse);
      setConversationId(typeof data.conversation?.id === "string" ? data.conversation.id : null);
      void loadRecent();
    } catch {
      setError("Network error. Try again.");
    } finally {
      window.clearInterval(stepInterval);
      setLoading(false);
    }
  }

  async function handleGenerateLaunch() {
    setSavingLaunch(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-startup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, save: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Launch generation failed");
        return;
      }
      const id = data.startup?.id as string | undefined;
      if (id) {
        router.push(`/startup/${id}/dashboard-preview`);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSavingLaunch(false);
    }
  }

  return (
    <motion.div
      className="mx-auto max-w-6xl space-y-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="space-y-3">
        <Link
          href="/app/ai"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Mr.Software AI
        </Link>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)]/10 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Startup Advisor
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Turn ideas into deployable software businesses
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              Describe your product idea. Mr.Software AI returns business analysis, feature planning,
              technical architecture, and a path to save it in your workspace.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="modern-card space-y-4 p-5 sm:p-6">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Your idea
            </span>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm leading-relaxed text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="I want to build a school management SaaS for private schools in East Africa…"
            />
          </label>

          <button
            type="button"
            onClick={() => void handleAnalyze()}
            disabled={loading || idea.trim().length < 3}
            className="btn-brand btn-brand-shine group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {loading ? "Analyzing…" : "Analyze with Mr.Software AI"}
            {!loading ? (
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            ) : null}
          </button>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          {recent.length > 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Recent analyses
              </p>
              <ul className="mt-2 space-y-1">
                {recent.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/app/ai/startup-advisor?conversation=${item.id}`}
                      className="block truncate rounded-lg px-2 py-1.5 text-sm text-[var(--foreground)] transition hover:bg-[var(--accent-muted)]"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="min-h-[24rem]">
          {loading ? (
            <GenerationLoading step={loadingStep} />
          ) : analysis ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-muted)]/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                  {analysis.projectName}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                  {analysis.solution}
                </p>
              </div>

              <SectionCard title="Problem & opportunity" icon={Target}>
                <p>{analysis.problem}</p>
                <BulletList items={analysis.marketOpportunities} />
              </SectionCard>

              <SectionCard title="Business model" icon={TrendingUp}>
                <p>{analysis.businessModel}</p>
                <p className="font-medium text-[var(--foreground)]">Target users</p>
                <BulletList items={analysis.targetUsers} />
                <p className="font-medium text-[var(--foreground)]">Pricing ideas</p>
                <ul className="space-y-2">
                  {analysis.pricingIdeas.map((tier) => (
                    <li key={tier.name} className="rounded-lg border border-[var(--border)] px-3 py-2">
                      <span className="font-medium text-[var(--foreground)]">
                        {tier.name} — {tier.price}
                      </span>
                      <p className="mt-0.5 text-xs">{tier.rationale}</p>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard title="Feature roadmap" icon={Layers}>
                <BulletList items={analysis.features} />
              </SectionCard>

              <SectionCard title="Technical architecture" icon={Database}>
                <p>
                  <span className="font-medium text-[var(--foreground)]">Frontend:</span>{" "}
                  {analysis.technicalArchitecture.frontend}
                </p>
                <p>
                  <span className="font-medium text-[var(--foreground)]">Backend:</span>{" "}
                  {analysis.technicalArchitecture.backend}
                </p>
                <p>
                  <span className="font-medium text-[var(--foreground)]">Database:</span>{" "}
                  {analysis.technicalArchitecture.database}
                </p>
                <p className="font-medium text-[var(--foreground)]">Modules</p>
                <BulletList items={analysis.technicalArchitecture.modules} />
              </SectionCard>

              <SectionCard title="Go-to-market" icon={Rocket}>
                <p>{analysis.deploymentPlan}</p>
                <p className="mt-2">{analysis.monetizationStrategy}</p>
              </SectionCard>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void handleGenerateLaunch()}
                  disabled={savingLaunch}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {savingLaunch ? "Generating…" : "Save launch draft to workspace"}
                </button>
                <Link
                  href="/app/ai/blueprint"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent-muted)]"
                >
                  Open SaaS Blueprint
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              {conversationId ? (
                <p className="text-center text-xs text-[var(--muted)]">
                  Saved to your AI workspace · conversation {conversationId.slice(0, 8)}…
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 p-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
                <Brain className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">
                Your SaaS blueprint appears here
              </p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
                Business analysis, architecture, features, and monetization — powered by Mr.Software
                AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
