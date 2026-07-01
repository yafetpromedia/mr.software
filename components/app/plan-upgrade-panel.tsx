"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Ticket } from "lucide-react";
import type { WorkspacePlanDefinition } from "@/lib/subscription/plans";
import { formatPlanPrice } from "@/lib/subscription/plans";

type Props = {
  currentPlanId: "free" | "pro";
  plans: WorkspacePlanDefinition[];
  stripeConfigured: boolean;
  chapaConfigured: boolean;
  telebirrEnabled: boolean;
  devUpgradeEnabled: boolean;
  expiresAt: string | null;
  usedSlots: number;
};

export function PlanUpgradePanel({
  currentPlanId,
  plans,
  stripeConfigured,
  chapaConfigured,
  telebirrEnabled,
  devUpgradeEnabled,
  expiresAt,
  usedSlots,
}: Props) {
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState<"stripe" | "chapa" | "telebirr" | "dev" | "coupon" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    const upgrade = searchParams.get("upgrade");
    if (upgrade === "success") {
      setMessage("Payment received — your Pro plan will activate shortly. Refresh if it does not update.");
    } else if (upgrade === "cancel") {
      setMessage("Checkout canceled. You can try again when ready.");
    }
  }, [searchParams]);

  async function startStripe() {
    setBusy("stripe");
    setMessage(null);
    try {
      const res = await fetch("/api/subscription/checkout/stripe", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        setMessage(data.error ?? "Could not start Stripe checkout");
        return;
      }
      window.location.href = data.url;
    } finally {
      setBusy(null);
    }
  }

  async function startChapa(method: "chapa" | "telebirr") {
    setBusy(method);
    setMessage(null);
    try {
      const res = await fetch("/api/subscription/checkout/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ method }),
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        setMessage(data.error ?? "Could not start Chapa checkout");
        return;
      }
      window.location.href = data.url;
    } finally {
      setBusy(null);
    }
  }

  async function devGrant() {
    setBusy("dev");
    setMessage(null);
    try {
      const res = await fetch("/api/subscription/dev-grant", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Dev upgrade failed");
        return;
      }
      window.location.href = "/payouts?upgrade=success";
    } finally {
      setBusy(null);
    }
  }

  async function redeemCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setBusy("coupon");
    setMessage(null);
    try {
      const res = await fetch("/api/subscription/redeem-coupon", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = (await res.json()) as {
        error?: string;
        expiresAt?: string;
        durationDays?: number;
      };
      if (!res.ok) {
        setMessage(data.error ?? "Invalid coupon code");
        return;
      }
      const until = data.expiresAt
        ? new Date(data.expiresAt).toLocaleDateString()
        : "soon";
      setMessage(
        `Pro activated for ${data.durationDays ?? 30} days — active until ${until}. Refreshing…`,
      );
      window.setTimeout(() => {
        window.location.href = "/payouts?upgrade=success";
      }, 1200);
    } finally {
      setBusy(null);
    }
  }

  const isPro = currentPlanId === "pro";

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-stone-700 dark:text-[var(--foreground)]">
          {message}
        </p>
      ) : null}

      {isPro && expiresAt ? (
        <p className="text-sm text-stone-600 dark:text-[var(--muted)]">
          Pro active until{" "}
          <span className="font-medium text-stone-900 dark:text-[var(--foreground)]">
            {new Date(expiresAt).toLocaleDateString()}
          </span>
          {usedSlots > 0 ? ` · ${usedSlots} deployment slot${usedSlots === 1 ? "" : "s"} in use` : null}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => {
          const active = plan.id === currentPlanId;
          const isProCard = plan.id === "pro";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-5 sm:p-6 ${
                isProCard
                  ? "border-orange-300 bg-gradient-to-b from-orange-50/80 to-white shadow-[var(--shadow-card)] dark:border-[var(--accent)]/35 dark:from-[var(--accent-muted)]/30 dark:to-[var(--surface)]"
                  : "border-stone-200 bg-white dark:border-[var(--border)] dark:bg-[var(--surface)]"
              }`}
            >
              {active ? (
                <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
                  Current
                </span>
              ) : null}

              <h3 className="font-display text-xl font-bold text-stone-900 dark:text-[var(--foreground)]">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-[var(--muted)]">{plan.tagline}</p>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                {plan.usdCents === 0 ? (
                  <p className="font-display text-3xl font-bold text-stone-900 dark:text-[var(--foreground)]">
                    Free
                  </p>
                ) : (
                  <>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                        USD
                      </p>
                      <p className="font-display text-2xl font-bold tabular-nums text-stone-900 dark:text-[var(--foreground)]">
                        {formatPlanPrice(plan.usdCents, "USD")}
                        <span className="text-sm font-medium text-stone-500 dark:text-[var(--muted)]">/mo</span>
                      </p>
                    </div>
                    <div className="h-8 w-px bg-stone-200 dark:bg-[var(--border)]" aria-hidden />
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                        ETB (Birr)
                      </p>
                      <p className="font-display text-2xl font-bold tabular-nums text-stone-900 dark:text-[var(--foreground)]">
                        {formatPlanPrice(plan.etbCents, "ETB")}
                        <span className="text-sm font-medium text-stone-500 dark:text-[var(--muted)]">/mo</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2 text-sm text-stone-600 dark:text-[var(--muted)]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2">
                {isProCard && !isPro ? (
                  <>
                    {stripeConfigured ? (
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => void startStripe()}
                        className="btn-brand flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-60"
                      >
                        {busy === "stripe" ? "Redirecting…" : "Upgrade · Pay in USD (Stripe)"}
                      </button>
                    ) : null}
                    {chapaConfigured ? (
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => void startChapa("chapa")}
                        className="flex h-10 w-full items-center justify-center rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-900 transition hover:border-orange-300 disabled:opacity-60 dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--foreground)]"
                      >
                        {busy === "chapa" ? "Redirecting…" : "Upgrade · Pay in ETB (Chapa)"}
                      </button>
                    ) : null}
                    {telebirrEnabled ? (
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => void startChapa("telebirr")}
                        className="flex h-10 w-full items-center justify-center rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-800 transition hover:border-orange-300 disabled:opacity-60 dark:border-[var(--border)] dark:bg-[var(--background)]"
                      >
                        {busy === "telebirr" ? "Redirecting…" : "Pay with Telebirr"}
                      </button>
                    ) : null}
                    {devUpgradeEnabled ? (
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => void devGrant()}
                        className="flex h-10 w-full items-center justify-center rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 text-sm font-semibold text-amber-900 disabled:opacity-60 dark:text-amber-200"
                      >
                        {busy === "dev" ? "…" : "Dev: activate Pro (no payment)"}
                      </button>
                    ) : null}
                    {!stripeConfigured && !chapaConfigured && !devUpgradeEnabled ? (
                      <p className="text-center text-xs text-stone-500 dark:text-[var(--muted)]">
                        Configure Stripe or Chapa to enable checkout.
                      </p>
                    ) : null}
                  </>
                ) : isProCard && isPro ? (
                  <p className="text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    You&apos;re on Pro — enjoy unlimited deployments.
                  </p>
                ) : (
                  <p className="text-center text-sm text-stone-500 dark:text-[var(--muted)]">
                    {usedSlots}/1 deployment slot used on Free.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isPro ? (
        <form
          onSubmit={(e) => void redeemCoupon(e)}
          className="rounded-2xl border border-dashed border-[var(--accent)]/35 bg-[var(--accent-muted)]/20 p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
              <Ticket className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">Have a coupon code?</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Redeem a friend or promo code for free Pro workspace access.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="FRIENDS-PRO"
                  className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm uppercase tracking-wide outline-none ring-[var(--accent)]/30 focus:ring-2"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={!!busy || !couponCode.trim()}
                  className="btn-brand inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-50"
                >
                  {busy === "coupon" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  Redeem
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
