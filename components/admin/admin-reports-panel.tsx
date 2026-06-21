"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AdminUserReport, ReportQueueStats } from "@/lib/reports-types";
import {
  REPORT_REASON_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_TARGET_LABEL,
} from "@/lib/reports-types";
import type { UserReportStatus } from "@prisma/client";

type StatusFilter = UserReportStatus | "ALL";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "ALL", label: "All" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusBadge(status: UserReportStatus) {
  const styles = {
    OPEN: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
    REVIEWING: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    RESOLVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    DISMISSED: "border-stone-400/30 bg-stone-500/10 text-stone-600 dark:text-stone-400",
  } as const;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {REPORT_STATUS_LABEL[status]}
    </span>
  );
}

function StatCard({
  label,
  value,
  accent,
  active,
  onClick,
}: {
  label: string;
  value: number;
  accent?: "danger" | "warn" | "ok" | "muted";
  active?: boolean;
  onClick?: () => void;
}) {
  const valueClass =
    accent === "danger" && value > 0
      ? "text-red-600 dark:text-red-400"
      : accent === "warn" && value > 0
        ? "text-amber-700 dark:text-amber-300"
        : "text-[var(--foreground)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md ${
        active
          ? "border-[var(--accent)]/40 bg-[var(--accent-muted)]/40"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/25"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </button>
  );
}

export function AdminReportsPanel() {
  const [filter, setFilter] = useState<StatusFilter>("OPEN");
  const [items, setItems] = useState<AdminUserReport[]>([]);
  const [stats, setStats] = useState<ReportQueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [resolutionDraft, setResolutionDraft] = useState<Record<string, string>>({});

  const load = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reports?status=${status}`, { credentials: "include" });
      const raw = await res.text();
      let data: {
        error?: string;
        reports?: AdminUserReport[];
        stats?: ReportQueueStats;
      } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as typeof data;
        } catch {
          throw new Error("Server returned an invalid response. Restart the dev server and try again.");
        }
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to load reports");
      setItems(data.reports ?? []);
      setStats(data.stats ?? null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load reports");
      setItems([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  async function updateReport(id: string, status: UserReportStatus) {
    setActingId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status,
          resolution: resolutionDraft[id] || null,
        }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string };
        } catch {
          throw new Error("Server returned an invalid response.");
        }
      }
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setMessage(`Report marked ${REPORT_STATUS_LABEL[status].toLowerCase()}.`);
      await load(filter);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Open queue"
            value={stats.open}
            accent="danger"
            active={filter === "OPEN"}
            onClick={() => setFilter("OPEN")}
          />
          <StatCard
            label="Reviewing"
            value={stats.reviewing}
            accent="warn"
            active={filter === "REVIEWING"}
            onClick={() => setFilter("REVIEWING")}
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            accent="ok"
            active={filter === "RESOLVED"}
            onClick={() => setFilter("RESOLVED")}
          />
          <StatCard
            label="Dismissed"
            value={stats.dismissed}
            accent="muted"
            active={filter === "DISMISSED"}
            onClick={() => setFilter("DISMISSED")}
          />
          <StatCard
            label="All time"
            value={stats.total}
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)]"
            }`}
          >
            {f.label}
            {f.value === "OPEN" && stats && stats.open > 0 ? (
              <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[0.6rem] text-white">
                {stats.open}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {message ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
          {message}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading reports…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          {message ? (
            <>
              <p className="text-sm font-medium text-[var(--foreground)]">Could not load reports</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Restart the dev server if you recently added database models, then refresh this page.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--foreground)]">Queue is clear</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                No {filter === "ALL" ? "" : filter.toLowerCase()} reports right now.
              </p>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
            >
              <div className="border-b border-[var(--border)] bg-gradient-to-r from-stone-50/80 to-red-50/30 px-5 py-4 dark:from-[var(--surface-elevated)]/50 dark:to-red-500/5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {statusBadge(item.status)}
                      <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--muted)]">
                        {REPORT_TARGET_LABEL[item.targetType]}
                      </span>
                      <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--muted)]">
                        {REPORT_REASON_LABEL[item.reason]}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-[var(--foreground)]">
                      {item.targetLabel}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Filed {formatDate(item.createdAt)} by {item.reporterName} (
                      {item.reporterEmail})
                    </p>
                  </div>
                  {item.targetHref ? (
                    <Link
                      href={item.targetHref}
                      target="_blank"
                      className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--background)]"
                    >
                      View target →
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6">
                {item.details ? (
                  <blockquote className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground)]">
                    {item.details}
                  </blockquote>
                ) : (
                  <p className="text-sm italic text-[var(--muted)]">No additional details provided.</p>
                )}

                {item.resolution ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      Resolution
                    </p>
                    <p className="mt-1 text-[var(--foreground)]">{item.resolution}</p>
                    {item.resolvedByName ? (
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Closed by {item.resolvedByName}
                        {item.resolvedAt ? ` · ${formatDate(item.resolvedAt)}` : ""}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <label className="block text-sm">
                    <span className="font-medium text-[var(--foreground)]">Admin notes (optional)</span>
                    <textarea
                      value={resolutionDraft[item.id] ?? ""}
                      onChange={(e) =>
                        setResolutionDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      rows={2}
                      placeholder="Document what you checked or why you're closing this report…"
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    />
                  </label>
                )}

                <div className="flex flex-wrap gap-2">
                  {item.status !== "REVIEWING" && item.status !== "RESOLVED" && item.status !== "DISMISSED" ? (
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => void updateReport(item.id, "REVIEWING")}
                      className="rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/10 disabled:opacity-60 dark:text-amber-400"
                    >
                      Start review
                    </button>
                  ) : null}
                  {item.status !== "RESOLVED" ? (
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => void updateReport(item.id, "RESOLVED")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Resolve
                    </button>
                  ) : null}
                  {item.status !== "DISMISSED" ? (
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => void updateReport(item.id, "DISMISSED")}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--background)] disabled:opacity-60"
                    >
                      Dismiss
                    </button>
                  ) : null}
                  {item.status !== "OPEN" ? (
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => void updateReport(item.id, "OPEN")}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--background)] disabled:opacity-60"
                    >
                      Reopen
                    </button>
                  ) : null}
                  <Link
                    href="/admin/moderation"
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--background)]"
                  >
                    Moderation tools →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
