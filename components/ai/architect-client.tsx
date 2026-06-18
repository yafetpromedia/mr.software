"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Layers } from "lucide-react";
import { GenerationLoading } from "@/components/startup/generation-loading";
import type { SoftwareArchitectPlan } from "@/lib/ai/schema";

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
      setError("Network error.");
    } finally {
      window.clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/app/ai"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Mr.Software AI
      </Link>
      <header>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Software Architect
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--foreground)]">
          Technical architecture planning
        </h1>
      </header>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={3}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent)]/20"
        placeholder="Describe the system to architect…"
      />
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        rows={2}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]/40"
        placeholder="Optional context (scale, region, integrations)…"
      />
      <button
        type="button"
        disabled={loading || idea.trim().length < 3}
        onClick={() => void handleSubmit()}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white disabled:opacity-50"
      >
        <Layers className="h-4 w-4" aria-hidden />
        Generate architecture
      </button>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {loading ? (
        <GenerationLoading step={step} />
      ) : plan ? (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          <p className="text-[var(--foreground)]">{plan.summary}</p>
          <p>
            <strong className="text-[var(--foreground)]">Frontend:</strong> {plan.frontend}
          </p>
          <p>
            <strong className="text-[var(--foreground)]">Backend:</strong> {plan.backend}
          </p>
          <p>
            <strong className="text-[var(--foreground)]">Database:</strong> {plan.database}
          </p>
          <div>
            <strong className="text-[var(--foreground)]">Modules</strong>
            <ul className="mt-1 list-inside list-disc">
              {plan.modules.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong className="text-[var(--foreground)]">API structure</strong>
            <ul className="mt-1 list-inside list-disc">
              {plan.apiStructure.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <p>{plan.deploymentNotes}</p>
        </div>
      ) : null}
    </div>
  );
}
