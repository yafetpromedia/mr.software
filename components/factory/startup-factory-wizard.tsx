"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FactoryStep, SoftwareCategory } from "@prisma/client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Rocket,
  Sparkles,
  Store,
  Upload,
} from "lucide-react";
import { DeployUploadForm } from "@/components/app/deploy-upload-form";
import { ListingCreateForm } from "@/components/app/listing-create-form";
import { DeployGithubPanel } from "@/components/deploy/deploy-github-panel";
import { FactoryStepIndicator } from "@/components/factory/factory-step-indicator";
import { GenerationLoading } from "@/components/startup/generation-loading";
import { GithubIcon } from "@/components/icons/github-icon";
import { STARTUP_AI_TEAM } from "@/lib/ai/startup-team";
import type { StartupAdvisorAnalysis } from "@/lib/ai/schema";
import { buildListingPrefill, buildStorefrontPrefill } from "@/lib/factory/prefill";
import type { FactoryProgress, FactorySessionView } from "@/lib/factory/types";
import { FACTORY_STEP_ORDER } from "@/lib/factory/types";
import type { GeneratedStartupPayload } from "@/lib/startup/types";
import { normalizeHandle } from "@/lib/storefront/handles";

type Props = {
  initialSession: FactorySessionView | null;
  initialProgress: FactoryProgress;
  hasStorefront: boolean;
  existingHandle: string | null;
  freeBlocked: boolean;
};

const STEP_FROM_QUERY: Record<string, FactoryStep> = {
  idea: "IDEA",
  validation: "VALIDATION",
  package: "PACKAGE",
  deploy: "DEPLOY",
  storefront: "STOREFRONT",
  listing: "LISTING",
  complete: "COMPLETE",
};

function stepIndex(step: FactoryStep): number {
  return FACTORY_STEP_ORDER.indexOf(step);
}

function completedSteps(session: FactorySessionView | null, progress: FactoryProgress): Set<FactoryStep> {
  const set = new Set<FactoryStep>();
  for (const item of progress.items) {
    if (item.done) set.add(item.step);
  }
  if (session?.currentStep === "COMPLETE" || session?.completedAt) {
    set.add("COMPLETE");
  }
  return set;
}

export function StartupFactoryWizard({
  initialSession,
  initialProgress,
  hasStorefront,
  existingHandle,
  freeBlocked,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [session, setSession] = useState(initialSession);
  const [progress, setProgress] = useState(initialProgress);
  const [idea, setIdea] = useState(initialSession?.idea ?? "");
  const [analysis, setAnalysis] = useState<StartupAdvisorAnalysis | null>(
    initialSession?.analysis ?? null,
  );
  const [startupPayload, setStartupPayload] = useState<GeneratedStartupPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [handle, setHandle] = useState(existingHandle ?? "");
  const [tagline, setTagline] = useState("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(
    existingHandle ? true : null,
  );
  const [savingStorefront, setSavingStorefront] = useState(false);

  const [deployTab, setDeployTab] = useState<"github" | "zip">("github");

  const queryStep = searchParams.get("step");
  const currentStep: FactoryStep =
    (queryStep && STEP_FROM_QUERY[queryStep]) || session?.currentStep || "IDEA";

  const done = useMemo(() => completedSteps(session, progress), [session, progress]);

  const listingPrefill = useMemo(
    () => buildListingPrefill(idea, analysis, startupPayload),
    [idea, analysis, startupPayload],
  );

  const storefrontPrefill = useMemo(
    () => buildStorefrontPrefill(analysis, startupPayload),
    [analysis, startupPayload],
  );

  useEffect(() => {
    if (!tagline && storefrontPrefill.tagline) setTagline(storefrontPrefill.tagline);
  }, [storefrontPrefill.tagline, tagline]);

  const previewHandle = useMemo(() => normalizeHandle(handle), [handle]);

  useEffect(() => {
    if (!previewHandle || previewHandle.length < 3 || existingHandle === previewHandle) {
      setHandleAvailable(existingHandle === previewHandle ? true : null);
      return;
    }
    const timer = window.setTimeout(() => {
      void fetch(`/api/storefront/check?handle=${encodeURIComponent(previewHandle)}`)
        .then((res) => res.json())
        .then((data: { available?: boolean }) => setHandleAvailable(Boolean(data.available)))
        .catch(() => setHandleAvailable(null));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [previewHandle, existingHandle]);

  const patchSession = useCallback(
    async (id: string, body: Record<string, unknown>) => {
      const res = await fetch(`/api/factory/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not save progress");
      }
      if (data.session) setSession(data.session as FactorySessionView);
      if (data.progress) setProgress(data.progress as FactoryProgress);
      return data.session as FactorySessionView;
    },
    [],
  );

  function goToStep(step: FactoryStep) {
    const slug = step.toLowerCase();
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", slug);
    if (session?.id) params.set("session", session.id);
    router.push(`/app/factory?${params.toString()}`);
  }

  async function ensureSession(nextIdea?: string): Promise<FactorySessionView> {
    if (session?.id) {
      if (nextIdea && nextIdea !== session.idea) {
        return patchSession(session.id, { idea: nextIdea, currentStep: "IDEA" });
      }
      return session;
    }
    const res = await fetch("/api/factory", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: (nextIdea ?? idea).trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Could not start factory");
    }
    setSession(data.session as FactorySessionView);
    setProgress(data.progress as FactoryProgress);
    return data.session as FactorySessionView;
  }

  async function handleStartIdea() {
    setError(null);
    setLoading(true);
    try {
      const s = await ensureSession(idea);
      await patchSession(s.id, { currentStep: "VALIDATION" });
      goToStep("VALIDATION");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setLoading(false);
    }
  }

  async function handleValidate() {
    setError(null);
    setLoading(true);
    setLoadingStep(0);
    const stepInterval = window.setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 4));
    }, 900);

    try {
      const s = await ensureSession(idea);
      const res = await fetch("/api/ai/startup-advisor", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, save: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Validation failed");
      }
      const nextAnalysis = data.analysis as StartupAdvisorAnalysis;
      setAnalysis(nextAnalysis);
      await patchSession(s.id, {
        currentStep: "PACKAGE",
        analysis: nextAnalysis,
        conversationId: typeof data.conversation?.id === "string" ? data.conversation.id : null,
      });
      goToStep("PACKAGE");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      window.clearInterval(stepInterval);
      setLoading(false);
    }
  }

  async function handleGeneratePackage() {
    setError(null);
    setLoading(true);
    setLoadingStep(0);
    const stepInterval = window.setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 4));
    }, 900);

    try {
      const s = await ensureSession(idea);
      const res = await fetch("/api/generate-startup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, save: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Generation failed");
      }
      const id = data.startup?.id as string | undefined;
      const payload = data.startup?.payload as GeneratedStartupPayload | undefined;
      if (payload) setStartupPayload(payload);
      await patchSession(s.id, {
        currentStep: "DEPLOY",
        startupId: id ?? null,
      });
      goToStep("DEPLOY");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      window.clearInterval(stepInterval);
      setLoading(false);
    }
  }

  async function handleSkipDeploy() {
    try {
      const s = await ensureSession(idea);
      await patchSession(s.id, { currentStep: "STOREFRONT" });
      goToStep("STOREFRONT");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
    }
  }

  async function handleDeployRecorded(deploymentId: string) {
    try {
      const s = await ensureSession(idea);
      await patchSession(s.id, { deploymentId, currentStep: "STOREFRONT" });
      goToStep("STOREFRONT");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save deployment");
    }
  }

  async function handleContinueStorefront() {
    if (!session?.id) return;
    await patchSession(session.id, { currentStep: "LISTING" });
    goToStep("LISTING");
  }

  async function handleSaveStorefront(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.id) return;
    setSavingStorefront(true);
    setError(null);
    try {
      const res = await fetch("/api/storefront", {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          handle,
          tagline,
          bio: storefrontPrefill.bio,
          website: "",
          socialLinks: {},
          theme: "CLASSIC",
          showRevenuePublic: false,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not save storefront");
      }
      await patchSession(session.id, { currentStep: "LISTING" });
      goToStep("LISTING");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Storefront save failed");
    } finally {
      setSavingStorefront(false);
    }
  }

  async function handleListingCreated(software: { id: string; name: string }) {
    if (!session?.id) return;
    await patchSession(session.id, {
      softwareId: software.id,
      currentStep: "COMPLETE",
      markComplete: true,
    });
    goToStep("COMPLETE");
    router.refresh();
  }

  const projectName =
    analysis?.projectName ?? startupPayload?.name ?? listingPrefill.name ?? "Your startup";

  const githubConnectNext = `/api/github/connect?next=${encodeURIComponent(
    `/app/factory?step=deploy&session=${session?.id ?? ""}`,
  )}`;

  return (
    <motion.div
      className="mx-auto max-w-5xl space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)]/10 blur-3xl"
            aria-hidden
          />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              <Rocket className="h-3.5 w-3.5" aria-hidden />
              Startup Factory
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Idea → validation → deploy → marketplace
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              Create a startup inside Mr.Software with your AI team — one guided flow from concept to
              revenue-ready listing.
            </p>
            <ul className="flex flex-wrap gap-2">
              {STARTUP_AI_TEAM.filter((m) => m.id !== "founder").map((member) => (
                <li
                  key={member.id}
                  className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-[0.65rem] font-medium text-[var(--muted)]"
                  title={member.description}
                >
                  {member.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <FactoryStepIndicator
          current={currentStep}
          completed={done}
          onStepClick={(step) => {
            if (stepIndex(step) <= stepIndex(currentStep) || done.has(step)) goToStep(step);
          }}
        />
      </header>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {currentStep === "IDEA" ? (
        <section className="modern-card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">1. Describe your idea</h2>
          <p className="text-sm text-[var(--muted)]">
            What problem are you solving? Mr. Strategist will validate the market next.
          </p>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm leading-relaxed outline-none focus:border-[var(--accent)]/45 focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="I want to build a school management SaaS for private schools in East Africa…"
          />
          <button
            type="button"
            disabled={loading || idea.trim().length < 3}
            onClick={() => void handleStartIdea()}
            className="btn-brand inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Starting…" : "Start factory"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </section>
      ) : null}

      {currentStep === "VALIDATION" ? (
        <section className="modern-card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">2. AI validation</h2>
          {loading ? (
            <GenerationLoading step={loadingStep} />
          ) : analysis ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-muted)]/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                  {analysis.projectName}
                </p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{analysis.solution}</p>
              </div>
              <p className="text-sm text-[var(--muted)]">{analysis.businessModel}</p>
              <button
                type="button"
                onClick={() => goToStep("PACKAGE")}
                className="btn-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
              >
                Continue to build
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--muted)]">
                Mr. Strategist analyzes problem fit, pricing, and architecture for:
              </p>
              <p className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm italic text-[var(--foreground)]">
                {idea}
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleValidate()}
                className="btn-brand inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {loading ? "Analyzing…" : "Validate with AI"}
              </button>
            </>
          )}
        </section>
      ) : null}

      {currentStep === "PACKAGE" ? (
        <section className="modern-card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">3. Generate startup package</h2>
          {loading ? (
            <GenerationLoading step={loadingStep} />
          ) : session?.startupId ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--muted)]">
                Your launch draft for <strong className="text-[var(--foreground)]">{projectName}</strong>{" "}
                is saved.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/startup/${session.startupId}/dashboard-preview`}
                  className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--surface)]"
                >
                  Preview dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => goToStep("DEPLOY")}
                  className="btn-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
                >
                  Continue to deploy
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--muted)]">
                Mr. Developer and Mr. Designer create a landing draft and feature set you can deploy.
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleGeneratePackage()}
                className="btn-brand inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {loading ? "Generating…" : "Generate package"}
              </button>
            </>
          )}
        </section>
      ) : null}

      {currentStep === "DEPLOY" ? (
        <section className="modern-card space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">4. Deploy preview</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Recommended: connect GitHub. Or upload a ZIP build of your static site.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleSkipDeploy()}
              className="text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
            >
              Skip for now
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeployTab("github")}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${
                deployTab === "github"
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              <GithubIcon className="h-3.5 w-3.5" />
              GitHub
            </button>
            <button
              type="button"
              onClick={() => setDeployTab("zip")}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${
                deployTab === "zip"
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              ZIP upload
            </button>
          </div>

          {deployTab === "github" ? (
            <DeployGithubPanel
              freeBlocked={freeBlocked}
              connectNextUrl={githubConnectNext}
              redirectOnSuccess={false}
              onDeploySuccess={(d) => void handleDeployRecorded(d.id)}
            />
          ) : (
            <DeployUploadForm
              defaultName={projectName}
              redirectOnSuccess={false}
              onSuccess={(d) => void handleDeployRecorded(d.id)}
            />
          )}
        </section>
      ) : null}

      {currentStep === "STOREFRONT" ? (
        <section className="modern-card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">5. Claim your @handle</h2>
          <p className="text-sm text-[var(--muted)]">
            Your storefront is your identity on Mr.Software — where buyers discover all your products.
          </p>
          {hasStorefront && existingHandle ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--foreground)]">
                You already have{" "}
                <Link href={`/@${existingHandle}`} className="font-mono text-[var(--accent)] hover:underline">
                  @{existingHandle}
                </Link>
              </p>
              <button
                type="button"
                onClick={() => void handleContinueStorefront()}
                className="btn-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
              >
                Continue to listing
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSaveStorefront(e)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted)]">Handle</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-[var(--muted)]">@</span>
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    required
                    minLength={3}
                    className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    placeholder="yafet"
                  />
                </div>
                {handleAvailable === false ? (
                  <p className="mt-1 text-xs text-red-500">Handle is taken</p>
                ) : null}
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)]">Tagline</label>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  placeholder={storefrontPrefill.tagline || "Building software for Africa"}
                />
              </div>
              <button
                type="submit"
                disabled={savingStorefront || handleAvailable === false}
                className="btn-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-50"
              >
                <Store className="h-4 w-4" aria-hidden />
                {savingStorefront ? "Saving…" : "Save storefront"}
              </button>
            </form>
          )}
        </section>
      ) : null}

      {currentStep === "LISTING" ? (
        <section className="modern-card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">6. Marketplace listing</h2>
          <p className="text-sm text-[var(--muted)]">
            Mr. Marketer pre-filled your listing from the validation step. Publish when ready.
          </p>
          <ListingCreateForm
            initial={{
              name: listingPrefill.name,
              description: listingPrefill.description,
              category: listingPrefill.category as SoftwareCategory,
              pricingModel: listingPrefill.pricingModel,
              amount: listingPrefill.amount,
            }}
            submitLabel="Publish listing"
            onSuccess={(software) => void handleListingCreated(software)}
          />
        </section>
      ) : null}

      {currentStep === "COMPLETE" ? (
        <section className="modern-card space-y-5 p-6 text-center sm:p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden />
          <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">
            {projectName} is ready to launch
          </h2>
          <p className="mx-auto max-w-md text-sm text-[var(--muted)]">
            You validated the idea, generated a package, and published to the marketplace. Keep
            iterating from your command center.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/app"
              className="btn-brand inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold"
            >
              Command center
            </Link>
            {existingHandle || previewHandle ? (
              <Link
                href={`/@${existingHandle ?? previewHandle}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 text-sm font-medium"
              >
                <Globe className="h-4 w-4" aria-hidden />
                View storefront
              </Link>
            ) : null}
            <Link
              href="/earnings"
              className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium"
            >
              Track revenue
            </Link>
          </div>
        </section>
      ) : null}
    </motion.div>
  );
}
