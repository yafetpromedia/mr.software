"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserReportReason, UserReportTargetType } from "@prisma/client";
import {
  REPORT_REASON_LABEL,
  REPORT_TARGET_LABEL,
} from "@/lib/reports-types";

const TARGET_TYPES = Object.entries(REPORT_TARGET_LABEL) as [UserReportTargetType, string][];
const REASONS = Object.entries(REPORT_REASON_LABEL) as [UserReportReason, string][];

const TARGET_PLACEHOLDER: Record<UserReportTargetType, string> = {
  SOFTWARE: "Listing ID or /software/… URL",
  STOREFRONT: "@handle (e.g. @yafet)",
  USER: "User email or account ID",
};

export function ReportPageForm({ hasSession }: { hasSession: boolean }) {
  const searchParams = useSearchParams();
  const [targetType, setTargetType] = useState<UserReportTargetType>("SOFTWARE");
  const [targetRef, setTargetRef] = useState("");
  const [reason, setReason] = useState<UserReportReason>("MISLEADING");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    const label = searchParams.get("label");
    if (
      type === "SOFTWARE" ||
      type === "STOREFRONT" ||
      type === "USER"
    ) {
      setTargetType(type);
    }
    if (id) setTargetRef(id);
    if (label && id) {
      // label is display-only from URL; targetRef holds id
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSession) {
      window.location.href = `/auth/login?next=${encodeURIComponent("/report")}`;
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
          targetId: targetRef,
          reason,
          details,
          resolveTarget: true,
        }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string };
        } catch {
          throw new Error("Invalid server response.");
        }
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to submit report");
      setSuccess(true);
      setTargetRef("");
      setDetails("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">Report received</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
          Our moderation team will review your report. You can submit another if needed.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold"
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8"
    >
      {!hasSession ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          <Link href="/auth/login?next=/report" className="font-semibold underline">
            Sign in
          </Link>{" "}
          to file a report. We need an account to prevent abuse and follow up when necessary.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-[var(--foreground)]">What are you reporting?</span>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as UserReportTargetType)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
          >
            {TARGET_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

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
      </div>

      <label className="mt-4 block text-sm">
        <span className="font-medium text-[var(--foreground)]">Target</span>
        <input
          value={targetRef}
          onChange={(e) => setTargetRef(e.target.value)}
          required
          placeholder={TARGET_PLACEHOLDER[targetType]}
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          Tip: use the Report button on a listing or storefront page to pre-fill this automatically.
        </p>
      </label>

      <label className="mt-4 block text-sm">
        <span className="font-medium text-[var(--foreground)]">What happened?</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={5}
          required
          minLength={10}
          placeholder="Describe the issue with as much detail as possible…"
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-relaxed"
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-red-600 px-6 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
      >
        {submitting ? "Sending…" : hasSession ? "Submit report" : "Sign in to submit"}
      </button>
    </form>
  );
}
