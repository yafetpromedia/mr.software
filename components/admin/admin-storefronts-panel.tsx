"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AdminStorefrontRow } from "@/lib/storefront/admin";

export function AdminStorefrontsPanel() {
  const [items, setItems] = useState<AdminStorefrontRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingHandle, setActingHandle] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/storefronts", { credentials: "include" });
      const data = (await res.json()) as { error?: string; storefronts?: AdminStorefrontRow[] };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setItems(data.storefronts ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load storefronts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(
    handle: string,
    body: { verified?: boolean; featured?: boolean },
  ) {
    setActingHandle(handle);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/storefronts/${encodeURIComponent(handle)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; storefront?: AdminStorefrontRow };
      if (!res.ok || !data.storefront) {
        throw new Error(data.error ?? "Update failed");
      }
      setItems((prev) => prev.map((row) => (row.handle === handle ? data.storefront! : row)));
      setMessage(`Updated @${handle}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    } finally {
      setActingHandle(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading storefronts…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-sm text-[var(--muted)]">
        No developer storefronts yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      <ul className="space-y-3">
        {items.map((row) => (
          <li
            key={row.handle}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[var(--foreground)]">{row.name}</p>
                  <span className="font-mono text-xs text-[var(--muted)]">@{row.handle}</span>
                  {row.verified ? (
                    <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-sky-700 dark:text-sky-300">
                      Verified
                    </span>
                  ) : null}
                  {row.featured ? (
                    <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent-muted)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-[var(--accent)]">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">{row.email}</p>
                {row.tagline ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">{row.tagline}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem] text-[var(--muted)]">
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5">
                    {row.theme}
                  </span>
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5">
                    {row.productCount} products
                  </span>
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5">
                    {row.followerCount} followers
                  </span>
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5">
                    {row.viewCount} views
                  </span>
                  {row.showRevenuePublic ? (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                      Public revenue on
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={`/@${row.handle}`}
                  className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] px-3 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--accent)]/40"
                >
                  View store
                </Link>
                <button
                  type="button"
                  disabled={actingHandle === row.handle}
                  onClick={() => void patch(row.handle, { verified: !row.verified })}
                  className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] px-3 text-xs font-semibold text-[var(--foreground)] hover:border-sky-500/40 disabled:opacity-50"
                >
                  {row.verified ? "Revoke verified" : "Verify"}
                </button>
                <button
                  type="button"
                  disabled={actingHandle === row.handle}
                  onClick={() => void patch(row.handle, { featured: !row.featured })}
                  className="inline-flex h-9 items-center rounded-xl bg-[var(--foreground)] px-3 text-xs font-semibold text-[var(--background)] disabled:opacity-50"
                >
                  {row.featured ? "Unfeature" : "Feature"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
