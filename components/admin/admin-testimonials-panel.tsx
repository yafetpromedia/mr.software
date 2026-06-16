"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminTestimonial } from "@/lib/testimonials";

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

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

function statusBadge(status: AdminTestimonial["status"]) {
  const styles = {
    PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    REJECTED: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  } as const;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function AdminTestimonialsPanel() {
  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  const [items, setItems] = useState<AdminTestimonial[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials?status=${status}`, {
        credentials: "include",
      });
      const data = (await res.json()) as {
        error?: string;
        testimonials?: AdminTestimonial[];
        pendingCount?: number;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setItems(data.testimonials ?? []);
      setPendingCount(data.pendingCount ?? 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  async function setStatus(id: string, status: "APPROVED" | "REJECTED" | "PENDING") {
    setActingId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setMessage(
        status === "APPROVED"
          ? "Approved — visible on the landing page."
          : status === "REJECTED"
            ? "Rejected."
            : "Moved back to pending.",
      );
      await load(filter);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
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
            {f.value === "PENDING" && pendingCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[0.6rem] text-white">
                {pendingCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading testimonials...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
          No {filter === "ALL" ? "" : filter.toLowerCase()} testimonials yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">{item.name}</h3>
                    {statusBadge(item.status)}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {[item.role, item.company].filter(Boolean).join(" · ") || "No role listed"}
                  </p>
                  {item.email ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">Contact: {item.email}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Submitted {formatDate(item.submittedAt)}
                  </p>
                </div>
                {item.rating ? (
                  <p className="text-xs font-medium text-[var(--accent)]">{item.rating}/5 stars</p>
                ) : null}
              </div>

              <blockquote className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground)]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.status !== "APPROVED" ? (
                  <button
                    type="button"
                    disabled={actingId === item.id}
                    onClick={() => void setStatus(item.id, "APPROVED")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Approve
                  </button>
                ) : null}
                {item.status !== "REJECTED" ? (
                  <button
                    type="button"
                    disabled={actingId === item.id}
                    onClick={() => void setStatus(item.id, "REJECTED")}
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Reject
                  </button>
                ) : null}
                {item.status !== "PENDING" ? (
                  <button
                    type="button"
                    disabled={actingId === item.id}
                    onClick={() => void setStatus(item.id, "PENDING")}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--background)] disabled:opacity-60"
                  >
                    Mark pending
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
