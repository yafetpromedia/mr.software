"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Rocket } from "lucide-react";
import { GenerationLoading } from "@/components/startup/generation-loading";
import type { DeploymentPlan } from "@/lib/ai/deployment-advisor";

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
          Deployment Advisor
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--foreground)]">
          Hosting and release strategy
        </h1>
      </header>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent)]/20"
      />
      <button
        type="button"
        disabled={loading || idea.trim().length < 3}
        onClick={() => void handleSubmit()}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white disabled:opacity-50"
      >
        <Rocket className="h-4 w-4" aria-hidden />
        Get deployment plan
      </button>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {loading ? (
        <GenerationLoading step={step} />
      ) : plan ? (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          <p className="text-[var(--foreground)]">{plan.summary}</p>
          <p>
            <strong className="text-[var(--foreground)]">Mr.Software path:</strong>{" "}
            {plan.mrSoftwarePath}
          </p>
          <div>
            <strong className="text-[var(--foreground)]">Environments</strong>
            <ul className="mt-1 list-inside list-disc">
              {plan.environments.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
          {plan.hostingOptions.map((h) => (
            <div key={h.name} className="rounded-lg border border-[var(--border)] p-3">
              <p className="font-medium text-[var(--foreground)]">{h.name}</p>
              <p className="mt-1">{h.fit}</p>
              <p className="mt-1 text-xs">{h.tradeoffs}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
