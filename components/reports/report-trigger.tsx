"use client";

import { useState } from "react";
import type { UserReportTargetType } from "@prisma/client";
import { ReportDialog } from "@/components/reports/report-dialog";

type Props = {
  targetType: UserReportTargetType;
  targetId: string;
  targetLabel: string;
  hasSession: boolean;
  loginNext?: string;
  disabled?: boolean;
  disabledReason?: string;
  className?: string;
  variant?: "link" | "button";
};

export function ReportTrigger({
  targetType,
  targetId,
  targetLabel,
  hasSession,
  loginNext,
  disabled = false,
  disabledReason,
  className = "",
  variant = "link",
}: Props) {
  const [open, setOpen] = useState(false);

  const baseClass =
    variant === "button"
      ? "inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
      : "inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-red-600 disabled:opacity-50 dark:text-[var(--muted)] dark:hover:text-red-400";

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        title={disabled ? disabledReason : "Report this content"}
        onClick={() => setOpen(true)}
        className={`${baseClass} ${className}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        Report
      </button>
      <ReportDialog
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetLabel={targetLabel}
        hasSession={hasSession}
        loginNext={loginNext}
      />
    </>
  );
}
