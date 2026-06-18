"use client";

import { useState } from "react";

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
  const [error, setError] = useState("");
  const styles = followStyles[variant];

  if (isOwner) {
    return (
      <div className="flex items-center gap-3">
        <span className={styles.count}>
          <span className="font-semibold tabular-nums text-inherit">{count.toLocaleString()}</span>{" "}
          follower{count === 1 ? "" : "s"}
        </span>
      </div>
    );
  }

  async function toggle() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/storefront/${encodeURIComponent(handle)}/follow`, {
        method: following ? "DELETE" : "POST",
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.href = `/auth/login?next=${encodeURIComponent(`/@${handle}`)}`;
        return;
      }
      const data = (await res.json()) as { error?: string; followerCount?: number };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setFollowing(!following);
      if (typeof data.followerCount === "number") setCount(data.followerCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update follow status");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
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
          <span className="font-semibold tabular-nums text-inherit">{count.toLocaleString()}</span>{" "}
          follower{count === 1 ? "" : "s"}
        </span>
      </div>
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
