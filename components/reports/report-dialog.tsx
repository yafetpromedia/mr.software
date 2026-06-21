"use client";

import { useEffect, useState } from "react";
import type { UserReportReason, UserReportTargetType } from "@prisma/client";
import { REPORT_REASON_LABEL, REPORT_TARGET_LABEL } from "@/lib/reports-types";

const REASONS = Object.entries(REPORT_REASON_LABEL) as [UserReportReason, string][];

export function ReportDialog({
  open,
  onClose,
  targetType,
  targetId,
  targetLabel,
  hasSession,
  loginNext,
}: {
  open: boolean;
  onClose: () => void;
  targetType: UserReportTargetType;
  targetId: string;
  targetLabel: string;
  hasSession: boolean;
  loginNext?: string;
}) {
  const [reason, setReason] = useState<UserReportReason>("MISLEADING");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setError("");
      setSuccess(false);
      setDetails("");
      setReason("MISLEADING");
    }
  }, [open]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSession) {
      const next = loginNext ?? window.location.pathname;
      window.location.href = `/auth/login?next=${encodeURIComponent(next)}`;
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details,
        }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string };
        } catch {
          throw new Error("Invalid server response. Try again.");
        }
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to submit report");
      setSuccess(true);
      setTimeout(() => onClose(), 2400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        aria-label="Close report dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        className="fixed inset-x-4 bottom-4 top-auto z-[70] mx-auto max-h-[min(90dvh,36rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
      >
        {success ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Report submitted</h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
              Thanks — our team will review this and take action if needed.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Report {REPORT_TARGET_LABEL[targetType].toLowerCase()}
                </p>
                <h2 id="report-dialog-title" className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                  {targetLabel}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Flag spam, scams, copyright issues, or misleading content. Reports are reviewed by
                  platform admins.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--background)]"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!hasSession ? (
              <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                Sign in to submit a report. We attach your account so admins can follow up if needed.
              </div>
            ) : null}

            <form onSubmit={(e) => void onSubmit(e)} className="mt-5 space-y-4">
              <label className="block text-sm">
                <span className="font-medium text-[var(--foreground)]">Reason</span>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as UserReportReason)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
                >
                  {REASONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="font-medium text-[var(--foreground)]">Details</span>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Describe what is wrong and include any links or context that helps us investigate…"
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-relaxed"
                />
              </label>

              {error ? (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                >
                  {submitting ? "Sending…" : hasSession ? "Submit report" : "Sign in to report"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
