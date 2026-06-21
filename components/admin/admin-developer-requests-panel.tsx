"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AdminDeveloperAccessRequest, DeveloperAccessQueueStats } from "@/lib/developer-access/types";
import { DEVELOPER_ACCESS_STATUS_LABEL } from "@/lib/developer-access/types";
import type { DeveloperAccessRequestStatus } from "@prisma/client";

type StatusFilter = DeveloperAccessRequestStatus | "ALL";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusBadge(status: DeveloperAccessRequestStatus) {
  const styles = {
    PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    REJECTED: "border-stone-400/30 bg-stone-500/10 text-stone-600 dark:text-stone-400",
  } as const;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {DEVELOPER_ACCESS_STATUS_LABEL[status]}
    </span>
  );
}

export function AdminDeveloperRequestsPanel() {
  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  const [items, setItems] = useState<AdminDeveloperAccessRequest[]>([]);
  const [stats, setStats] = useState<DeveloperAccessQueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const load = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/developer-requests?status=${status}`, {
        credentials: "include",
      });
      const raw = await res.text();
      let data: {
        error?: string;
        requests?: AdminDeveloperAccessRequest[];
        stats?: DeveloperAccessQueueStats;
      } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as typeof data;
        } catch {
          throw new Error("Invalid response from server");
        }
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to load requests");
      setItems(data.requests ?? []);
      setStats(data.stats ?? null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  async function review(id: string, action: "approve" | "reject") {
    setActingId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/developer-requests/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, adminNote: noteDraft[id] ?? "" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setMessage(action === "approve" ? "User promoted to Developer." : "Request rejected.");
      await load(filter);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Pending", stats.pending, "PENDING"],
              ["Approved", stats.approved, "APPROVED"],
              ["Rejected", stats.rejected, "REJECTED"],
              ["Total", stats.total, "ALL"],
            ] as const
          ).map(([label, value, key]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-2xl border p-4 text-left transition ${
                filter === key
                  ? "border-[var(--accent)]/40 bg-[var(--accent-muted)]/40"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/25"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
              <p
                className={`mt-1 text-2xl font-semibold tabular-nums ${
                  key === "PENDING" && value > 0 ? "text-amber-700 dark:text-amber-300" : "text-[var(--foreground)]"
                }`}
              >
                {value}
              </p>
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {message ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          {message}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading requests…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">No requests in this queue</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Members submit from Settings → Developer access in their library.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const busy = actingId === item.id;
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--foreground)]">{item.userName}</p>
                      {statusBadge(item.status)}
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">{item.userEmail}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Requested {formatDate(item.createdAt)} · account {item.userStatus}
                    </p>
                  </div>
                  <Link
                    href={`/admin/users?q=${encodeURIComponent(item.userEmail)}`}
                    className="text-xs font-medium text-[var(--accent)] hover:underline"
                  >
                    View in Users →
                  </Link>
                </div>

                <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Pitch</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                    {item.pitch}
                  </p>
                  {item.website ? (
                    <p className="mt-3 text-sm">
                      <span className="text-[var(--muted)]">Link: </span>
                      <a
                        href={item.website.startsWith("http") ? item.website : `https://${item.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--accent)] hover:underline"
                      >
                        {item.website}
                      </a>
                    </p>
                  ) : null}
                </div>

                {item.status === "PENDING" ? (
                  <div className="mt-4 space-y-3">
                    <label className="block text-xs font-medium text-[var(--muted)]">
                      Note to member (optional — shown if rejected)
                    </label>
                    <textarea
                      rows={2}
                      value={noteDraft[item.id] ?? ""}
                      onChange={(e) =>
                        setNoteDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder="Reason or welcome message…"
                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void review(item.id, "approve")}
                        className="inline-flex h-10 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {busy ? "…" : "Approve & promote to Developer"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void review(item.id, "reject")}
                        className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : item.reviewedAt ? (
                  <p className="mt-4 text-xs text-[var(--muted)]">
                    Reviewed {formatDate(item.reviewedAt)}
                    {item.reviewedByName ? ` by ${item.reviewedByName}` : ""}
                    {item.adminNote ? ` — ${item.adminNote}` : ""}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
