"use client";

import { useEffect, useState } from "react";
import { formatPublicRevenue } from "@/lib/storefront/format-public-revenue";

type FollowVariant = "default" | "onColor" | "midnight";

const followStyles: Record<FollowVariant, { primary: string; following: string; count: string }> = {
  default: {
    primary:
      "rounded-xl bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] shadow-sm transition hover:opacity-90 disabled:opacity-60",
    following:
      "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-red-500/40 hover:text-red-600 disabled:opacity-60",
    count: "text-sm text-[var(--muted)]",
  },
  onColor: {
    primary:
      "rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[var(--accent)] shadow-lg shadow-black/10 transition hover:bg-white/95 disabled:opacity-60",
    following:
      "rounded-xl border border-white/35 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-60",
    count: "text-sm text-white/80",
  },
  midnight: {
    primary:
      "rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-400 disabled:opacity-60",
    following:
      "rounded-xl border border-zinc-600 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-60",
    count: "text-sm text-zinc-300",
  },
};

export function StorefrontFollowButton({
  handle,
  initialFollowing,
  initialCount,
  isOwner,
  variant = "default",
}: {
  handle: string;
  initialFollowing: boolean;
  initialCount: number;
  isOwner: boolean;
  variant?: FollowVariant;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const styles = followStyles[variant];

  if (isOwner) return null;

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/storefront/${encodeURIComponent(handle)}/follow`, {
        method: following ? "DELETE" : "POST",
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.href = `/auth/login?next=/${encodeURIComponent("@" + handle)}`;
        return;
      }
      const data = (await res.json()) as { error?: string; followerCount?: number };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setFollowing(!following);
      if (typeof data.followerCount === "number") setCount(data.followerCount);
    } catch {
      // ignore for MVP
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={() => void toggle()}
        className={following ? styles.following : styles.primary}
      >
        {busy ? "…" : following ? "Following" : "Follow"}
      </button>
      <span className={styles.count}>
        <span className="font-semibold tabular-nums text-inherit">{count}</span> followers
      </span>
    </div>
  );
}

export function StorefrontAnalyticsPanel() {
  const [data, setData] = useState<{
    viewCount: number;
    followerCount: number;
    productCount: number;
    totalRevenueCents: number;
    revenueCurrency: string;
    showRevenuePublic: boolean;
    recentFollowers: Array<{ name: string; followedAt: string }>;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetch("/api/storefront/analytics", { credentials: "include" })
      .then((res) => res.json())
      .then((json: { analytics?: typeof data }) => {
        setData(json.analytics ?? null);
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return <p className="text-sm text-[var(--muted)]">Loading analytics…</p>;
  }

  if (!data) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Create your storefront above to unlock views, followers, and product stats.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
          <p className="text-xs text-[var(--muted)]">Store views</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{data.viewCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
          <p className="text-xs text-[var(--muted)]">Followers</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{data.followerCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
          <p className="text-xs text-[var(--muted)]">Products</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{data.productCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
          <p className="text-xs text-[var(--muted)]">Lifetime revenue</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {formatPublicRevenue(data.totalRevenueCents, data.revenueCurrency)}
          </p>
          <p className="mt-1 text-[0.65rem] text-[var(--muted)]">
            {data.showRevenuePublic ? "Visible on your store" : "Hidden from public store"}
          </p>
        </div>
      </div>
      {data.recentFollowers.length > 0 ? (
        <div className="sm:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Recent followers
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--foreground)]">
            {data.recentFollowers.map((f, i) => (
              <li key={`${f.name}-${i}`}>
                {f.name}{" "}
                <span className="text-xs text-[var(--muted)]">
                  · {new Date(f.followedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
