"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Cloud,
  GitBranch,
  Rocket,
  Server,
  Shield,
  Sparkles,
} from "lucide-react";
import { GenerationLoading } from "@/components/startup/generation-loading";
import type { DeploymentPlan } from "@/lib/ai/deployment-advisor";

const PROMPTS = [
  "School management SaaS for East Africa",
  "Fitness tracker with mobile app",
  "NGO donation portal — low bandwidth",
  "Marketplace for local developers",
] as const;

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Rocket;
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
      <div className="text-sm leading-relaxed text-[var(--muted)]">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DeploymentAdvisorClient() {
  const [idea, setIdea] = useState("School management SaaS for East Africa");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<DeploymentPlan | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setStep(0);
    setError(null);
    setPlan(null);
    const interval = window.setInterval(() => setStep((s) => Math.min(s + 1, 4)), 800);
    try {
      const res = await fetch("/api/ai/deployment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Advice failed");
        return;
      }
      setPlan(data.plan as DeploymentPlan);
    } catch {
      setError("Network error. Try again.");
    } finally {
      window.clearInterval(interval);
      setLoading(false);
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
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
              <Rocket className="h-3.5 w-3.5" aria-hidden />
              Deployment Advisor
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Hosting and release strategy
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              Describe your product. Mr.Software AI recommends environments, hosting options, CI/CD
              steps, and the fastest path to ship on Mr.Software Cloud.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="modern-card space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="deploy-idea" className="text-sm font-semibold text-[var(--foreground)]">
              What are you deploying?
            </label>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Stack, audience, region, and scale help tailor the plan.
            </p>
          </div>

          <textarea
            id="deploy-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm leading-relaxed text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="e.g. School management SaaS for private schools in East Africa…"
          />

          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Try an example
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {PROMPTS.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setIdea(prompt)}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-left text-xs text-[var(--foreground)] transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent-muted)] disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {error ? (
            <p
              className="rounded-xl border border-red-500/25 bg-red-500/8 px-3 py-2 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={loading || idea.trim().length < 3}
            onClick={() => void handleSubmit()}
            className="btn-brand btn-brand-shine group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-50 sm:w-auto sm:min-w-[12rem] sm:px-8"
          >
            {loading ? (
              "Planning…"
            ) : (
              <>
                Get deployment plan
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </>
            )}
          </button>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Ready to ship?
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
              Open the Deployment Center to connect GitHub, upload a ZIP, or import from your
              marketplace.
            </p>
            <Link
              href="/deploy"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Go to Deployment Center
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="min-h-[20rem]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GenerationLoading step={step} />
              </motion.div>
            ) : plan ? (
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <SectionCard title="Summary" icon={Sparkles}>
                  <p className="text-[var(--foreground)]">{plan.summary}</p>
                </SectionCard>

                <SectionCard title="Mr.Software path" icon={Cloud}>
                  <p>{plan.mrSoftwarePath}</p>
                  <Link
                    href="/deploy"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Deploy now
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                </SectionCard>

                <SectionCard title="Environments" icon={Server}>
                  <BulletList items={plan.environments} />
                </SectionCard>

                <SectionCard title="Hosting options" icon={Server}>
                  <div className="space-y-3">
                    {plan.hostingOptions.map((h) => (
                      <div
                        key={h.name}
                        className="rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-3.5"
                      >
                        <p className="font-medium text-[var(--foreground)]">{h.name}</p>
                        <p className="mt-1">{h.fit}</p>
                        <p className="mt-1.5 text-xs opacity-80">{h.tradeoffs}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="CI/CD pipeline" icon={GitBranch}>
                  <BulletList items={plan.ciCdSteps} />
                </SectionCard>

                <SectionCard title="Security checklist" icon={Shield}>
                  <BulletList items={plan.securityChecklist} />
                </SectionCard>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 p-8 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-muted)] text-[var(--accent)]">
                  <Rocket className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">
                  Your deployment plan appears here
                </p>
                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
                  Mr.Software AI will recommend staging, production, hosting, and a path to go live.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
