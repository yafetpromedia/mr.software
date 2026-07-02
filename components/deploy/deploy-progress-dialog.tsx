"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Rocket,
  X,
  Zap,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";
import { BRAND_NAME } from "@/lib/branding/constants";

const DEPLOY_STEPS = [
  "Cloning repository",
  "Detecting framework",
  "Installing dependencies",
  "Building project",
  "Publishing to cloud",
] as const;

export type DeployProgressPhase = "deploying" | "success" | "error";

export type DeployProgressDialogProps = {
  open: boolean;
  projectName: string;
  sourceLabel?: string;
  phase: DeployProgressPhase;
  errorMessage?: string;
  liveUrl?: string | null;
  deploymentId?: string;
  onClose?: () => void;
};

export function DeployProgressDialog({
  open,
  projectName,
  sourceLabel = "GitHub",
  phase,
  errorMessage,
  liveUrl,
  deploymentId,
  onClose,
}: DeployProgressDialogProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!open || phase !== "deploying") {
      setStepIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, DEPLOY_STEPS.length - 1));
    }, 3200);

    return () => window.clearInterval(timer);
  }, [open, phase]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const activeStep = DEPLOY_STEPS[stepIndex];
  const canDismiss = phase !== "deploying";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label={canDismiss ? "Close dialog" : "Deployment in progress"}
            onClick={canDismiss ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deploy-progress-title"
            aria-busy={phase === "deploying"}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/20"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,var(--accent-muted),transparent_70%)]"
              aria-hidden
            />

            {canDismiss ? (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}

            <div className="relative px-6 pb-6 pt-8">
              <div className="flex justify-center">
                {phase === "deploying" ? (
                  <motion.div className="relative h-16 w-16" aria-hidden>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/25"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-2 rounded-full bg-[var(--accent-muted)]"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[var(--accent)]">
                      <Rocket className="h-6 w-6" />
                    </span>
                  </motion.div>
                ) : phase === "success" ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" aria-hidden />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <X className="h-8 w-8" aria-hidden />
                  </div>
                )}
              </div>

              <div className="mt-5 text-center">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {sourceLabel} deploy
                </p>
                <h2
                  id="deploy-progress-title"
                  className="mt-2 text-lg font-semibold text-[var(--foreground)]"
                >
                  {phase === "deploying"
                    ? "Deploying your project"
                    : phase === "success"
                      ? "Deployment complete"
                      : "Deployment failed"}
                </h2>
                <p className="mt-1 truncate text-sm text-[var(--muted)]">{projectName}</p>
              </div>

              {phase === "deploying" ? (
                <div className="mt-6 space-y-4">
                  <motion.p
                    key={activeStep}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center font-mono text-xs text-[var(--foreground)]"
                  >
                    {activeStep}…
                  </motion.p>

                  <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                    <motion.div
                      className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)]"
                      animate={{ x: ["-100%", "320%"] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>

                  <ul className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3">
                    {DEPLOY_STEPS.map((step, index) => {
                      const done = index < stepIndex;
                      const active = index === stepIndex;
                      return (
                        <li
                          key={step}
                          className={`flex items-center gap-2.5 text-xs transition ${
                            active
                              ? "font-medium text-[var(--foreground)]"
                              : done
                                ? "text-[var(--muted)]"
                                : "text-[var(--muted)]/70"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
                          ) : active ? (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--accent)]" aria-hidden />
                          ) : (
                            <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[var(--border)]" aria-hidden />
                          )}
                          {step}
                        </li>
                      );
                    })}
                  </ul>

                  <p className="text-center text-[0.65rem] leading-relaxed text-[var(--muted)]">
                    This can take a few minutes for larger apps. Keep this tab open while {BRAND_NAME}{" "}
                    builds and publishes your project.
                  </p>
                </div>
              ) : null}

              {phase === "success" ? (
                <div className="mt-6 space-y-4">
                  <p className="text-center text-sm text-[var(--muted)]">
                    Your app is live on {BRAND_NAME}. Open the preview or manage it from your projects.
                  </p>
                  {liveUrl ? (
                    <p className="break-all rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center font-mono text-[0.65rem] text-[var(--foreground)]">
                      {liveUrl}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    {liveUrl ? (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-brand inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold"
                      >
                        Open live URL
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    ) : null}
                    {deploymentId ? (
                      <Link
                        href={`/projects/${deploymentId}`}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium transition hover:bg-[var(--background)]"
                        onClick={onClose}
                      >
                        View project
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {phase === "error" ? (
                <div className="mt-6 space-y-4">
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-left">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-red-700 dark:text-red-300">
                      {errorMessage ?? "Something went wrong during deploy. Try again or upload a ZIP instead."}
                    </p>
                  </div>
                  <p className="text-center text-[0.65rem] text-[var(--muted)]">
                    Next.js 15 App Router builds need <code className="text-[var(--foreground)]">NODE_ENV=production</code>{" "}
                    and an <code className="text-[var(--foreground)]">app/not-found.tsx</code> file. Redeploy after
                    updating MrSoftware ET, or add those fixes in your repo.
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium transition hover:bg-[var(--background)]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : null}

              {phase === "deploying" ? (
                <div className="mt-5 flex items-center justify-center gap-2 text-[0.65rem] text-[var(--muted)]">
                  {sourceLabel === "GitHub" ? (
                    <GithubIcon className="h-3.5 w-3.5" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" aria-hidden />
                  )}
                  Connected to {sourceLabel}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
