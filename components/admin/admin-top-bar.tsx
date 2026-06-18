"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, Suspense } from "react";
import { Bell, Search } from "lucide-react";

function SearchForm() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const t = q.trim();
      router.push(t ? `/admin/users?q=${encodeURIComponent(t)}` : "/admin/users");
    },
    [q, router],
  );

  return (
    <form onSubmit={onSubmit} className="min-w-0 flex-1" role="search" aria-label="Search users">
      <label htmlFor="admin-global-search" className="sr-only">
        Search users by email
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
          aria-hidden
        />
        <input
          id="admin-global-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users by email…"
          className="h-10 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
    </form>
  );
}

export function AdminTopBar() {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
      <Suspense fallback={<div className="h-10 min-w-0 flex-1 rounded-full bg-[var(--surface)]" />}>
        <SearchForm />
      </Suspense>
      <button
        type="button"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
        aria-label="Alerts"
        title="Alerting not connected yet"
        disabled
      >
        <Bell className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
