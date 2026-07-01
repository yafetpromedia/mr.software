"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Loader2, Plus, Sparkles, Ticket, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

type CouponRow = {
  id: string;
  code: string;
  label: string | null;
  durationDays: number;
  maxRedemptions: number;
  redemptionCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  _count: { redemptions: number };
  redemptions: Array<{
    redeemedAt: string;
    user: { id: string; name: string; email: string };
  }>;
};

export function AdminCouponsPanel() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("Friends & family");
  const [durationDays, setDurationDays] = useState(30);
  const [maxRedemptions, setMaxRedemptions] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", { credentials: "include" });
      const data = (await res.json()) as { coupons?: CouponRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load coupons");
        return;
      }
      setCoupons(data.coupons ?? []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCoupon(autoGenerate: boolean) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: autoGenerate ? undefined : code,
          autoGenerate,
          label: label.trim() || undefined,
          durationDays,
          maxRedemptions,
        }),
      });
      const data = (await res.json()) as { coupon?: { code: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create coupon");
        return;
      }
      setNotice(`Created coupon ${data.coupon?.code ?? ""}`);
      if (!autoGenerate) setCode("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(coupon: CouponRow) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Update failed");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeCoupon(coupon: CouponRow) {
    if (!window.confirm(`Remove coupon ${coupon.code}?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string; deactivated?: boolean };
      if (!res.ok) {
        setError(data.error ?? "Delete failed");
        return;
      }
      setNotice(data.deactivated ? "Coupon deactivated (had redemptions)" : "Coupon deleted");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function copyCode(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`Copied ${value}`);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Pro coupon codes</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create codes for friends to unlock workspace Pro without payment. Each code grants Pro for
          a set number of days.
        </p>
      </div>

      {notice ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <Plus className="h-4 w-4 text-[var(--accent)]" aria-hidden />
          New coupon
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-[var(--muted)]">Code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="FRIENDS-PRO"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm uppercase tracking-wide outline-none ring-[var(--accent)]/30 focus:ring-2"
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-[var(--muted)]">Label (optional)</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Friends & family"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--muted)]">Pro duration (days)</span>
            <input
              type="number"
              min={1}
              max={3650}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--muted)]">Max uses</span>
            <input
              type="number"
              min={1}
              max={10000}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !code.trim()}
            onClick={() => void createCoupon(false)}
            className="btn-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
            Create code
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void createCoupon(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-medium transition hover:bg-[var(--background)] disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            Generate random code
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-[var(--muted)]">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Loading coupons…
        </div>
      ) : coupons.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center text-sm text-[var(--muted)]">
          No coupons yet. Create one for your friends to redeem on Billing &amp; payouts.
        </p>
      ) : (
        <ul className="space-y-3">
          {coupons.map((coupon) => (
            <li
              key={coupon.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded-lg bg-[var(--background)] px-2.5 py-1 font-mono text-sm font-semibold text-[var(--foreground)]">
                      {coupon.code}
                    </code>
                    <button
                      type="button"
                      onClick={() => void copyCode(coupon.code)}
                      className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                      aria-label={`Copy ${coupon.code}`}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {!coupon.active ? (
                      <span className="rounded-full bg-stone-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-stone-600 dark:text-stone-400">
                        Inactive
                      </span>
                    ) : null}
                  </div>
                  {coupon.label ? (
                    <p className="mt-1 text-sm text-[var(--muted)]">{coupon.label}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {coupon.durationDays} days Pro · {coupon.redemptionCount}/{coupon.maxRedemptions}{" "}
                    used
                    {coupon.expiresAt
                      ? ` · expires ${new Date(coupon.expiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void toggleActive(coupon)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-medium transition hover:bg-[var(--background)] disabled:opacity-50"
                  >
                    {coupon.active ? (
                      <ToggleRight className="h-4 w-4 text-emerald-500" aria-hidden />
                    ) : (
                      <ToggleLeft className="h-4 w-4" aria-hidden />
                    )}
                    {coupon.active ? "Active" : "Paused"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeCoupon(coupon)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-500/25 px-3 text-xs font-medium text-red-600 transition hover:bg-red-500/5 disabled:opacity-50 dark:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </button>
                </div>
              </div>
              {coupon.redemptions.length > 0 ? (
                <ul className="mt-4 space-y-1 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                  {coupon.redemptions.map((r) => (
                    <li key={`${r.user.id}-${r.redeemedAt}`}>
                      {r.user.name} ({r.user.email}) ·{" "}
                      {new Date(r.redeemedAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
