"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, Suspense } from "react";

function BarInner() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const t = q.trim();
      if (t) {
        router.push(`/admin/users?q=${encodeURIComponent(t)}`);
      } else {
        router.push("/admin/users");
      }
    },
    [q, router],
  );

  return (
    <form
      onSubmit={onSubmit}
      className="hidden min-w-0 max-w-md flex-1 sm:block"
      role="search"
      aria-label="Search users and records"
    >
      <label htmlFor="admin-global-search" className="sr-only">
        Global search
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-hidden>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
          <input
            id="admin-global-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users (by email)…"
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <button
          type="submit"
          className="h-9 shrink-0 rounded-lg bg-[var(--foreground)] px-3 text-sm font-medium text-[var(--background)]"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export function AdminTopBar() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
      <Suspense fallback={<div className="hidden min-w-0 max-w-md flex-1 sm:block" />}>
        <BarInner />
      </Suspense>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-flex h-8 items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 text-xs font-medium text-amber-900 dark:text-amber-200"
          title="Connect alerting for production"
        >
          Alerts
        </span>
      </div>
    </div>
  );
}
