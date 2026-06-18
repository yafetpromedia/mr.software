"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Cloud,
  Database,
  Layers,
  Monitor,
  Server,
  Sparkles,
} from "lucide-react";
import { GenerationLoading } from "@/components/startup/generation-loading";
import type { SoftwareArchitectPlan } from "@/lib/ai/schema";

const PROMPTS = [
  "CampusOne-like school management system",
  "Fitness tracker with mobile + web dashboard",
  "Multi-tenant NGO donation platform",
  "B2B inventory SaaS for retailers",
] as const;

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Layers;
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

function StackPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 px-3.5 py-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export function ArchitectClient() {
  const [idea, setIdea] = useState("Build a CampusOne-like school management system");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<SoftwareArchitectPlan | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setStep(0);
    setError(null);
    setPlan(null);
    const interval = window.setInterval(() => setStep((s) => Math.min(s + 1, 4)), 800);
    try {
      const res = await fetch("/api/ai/architect", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, context: context || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Planning failed");
        return;
      }
      setPlan(data.plan as SoftwareArchitectPlan);
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
              <Layers className="h-3.5 w-3.5" aria-hidden />
              Software Architect
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Technical architecture planning
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              Describe what you&apos;re building. Mr.Software AI recommends stack choices, modules,
              API structure, and how to deploy on Mr.Software Cloud.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="modern-card space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="architect-idea" className="text-sm font-semibold text-[var(--foreground)]">
              System to architect
            </label>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Product type, users, and core workflows.
            </p>
          </div>

          <textarea
            id="architect-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm leading-relaxed text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="Describe the system to architect…"
          />

          <div>
            <label htmlFor="architect-context" className="text-sm font-medium text-[var(--foreground)]">
              Optional context
            </label>
            <textarea
              id="architect-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="Scale, region, integrations, compliance…"
            />
          </div>

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
              "Architecting…"
            ) : (
              <>
                Generate architecture
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </>
            )}
          </button>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Next step
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
              Need business validation first? Run Startup Advisor, then deploy from the Deployment
              Center.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/app/ai/startup-advisor"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Startup Advisor
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
              <Link
                href="/deploy"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Deployment Center
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>
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
                <SectionCard title="Overview" icon={Sparkles}>
                  <p className="text-[var(--foreground)]">{plan.summary}</p>
                </SectionCard>

                <SectionCard title="Recommended stack" icon={Server}>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StackPill label="Frontend" value={plan.frontend} />
                    <StackPill label="Backend" value={plan.backend} />
                    <StackPill label="Database" value={plan.database} />
                  </div>
                </SectionCard>

                <SectionCard title="Modules" icon={Boxes}>
                  <BulletList items={plan.modules} />
                </SectionCard>

                <SectionCard title="API structure" icon={Monitor}>
                  <BulletList items={plan.apiStructure} />
                </SectionCard>

                <SectionCard title="Deployment" icon={Cloud}>
                  <p>{plan.deploymentNotes}</p>
                  <Link
                    href="/app/ai/deployment"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Open Deployment Advisor
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
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
                  <Layers className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">
                  Your architecture plan appears here
                </p>
                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
                  Stack, modules, APIs, and deployment notes — generated by Mr.Software AI.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
