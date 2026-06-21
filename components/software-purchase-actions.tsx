"use client";

import Link from "next/link";
import { useState } from "react";
import type { SoftwareDistributionType } from "@/lib/software-item";
import {
  allowsFileDownload,
  distributionAccessLabel,
  isHostedOnly,
  requiresLicenseKeyAtRuntime,
} from "@/lib/monetization/distribution-access";

type Props = {
  softwareId: string;
  pricingModel: "FREE" | "ONE_TIME" | "SUBSCRIPTION";
  distributionType?: SoftwareDistributionType;
  hostedAppUrl?: string | null;
  entitled: boolean;
  hasSession: boolean;
  isOwner: boolean;
  stripeConfigured: boolean;
  stripePriceId?: string | null;
  chapaConfigured: boolean;
  telebirrEnabled: boolean;
  priceCents: number;
  currency: string;
  devCheckoutEnabled: boolean;
  /** Compact layout inside product sidebar */
  embedded?: boolean;
};

export function SoftwarePurchaseActions({
  softwareId,
  pricingModel,
  distributionType = "COMPILED",
  hostedAppUrl,
  entitled,
  hasSession,
  isOwner,
  stripeConfigured,
  stripePriceId,
  chapaConfigured,
  telebirrEnabled,
  priceCents,
  currency,
  devCheckoutEnabled,
  embedded = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const needsPurchase =
    pricingModel !== "FREE" && !entitled && !isOwner;
  const canDownload = allowsFileDownload(distributionType);
  const hosted = isHostedOnly(distributionType);
  const accessHint = distributionAccessLabel(distributionType, entitled || isOwner);
  const canBuyStripe =
    needsPurchase &&
    stripeConfigured &&
    !!stripePriceId?.trim();
  const canBuyChapa =
    needsPurchase && chapaConfigured && pricingModel === "ONE_TIME";
  const showDevGrant =
    needsPurchase && devCheckoutEnabled && !canBuyStripe && !canBuyChapa;

  async function startCheckout() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ softwareId }),
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Checkout failed");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage("No checkout URL returned");
    } finally {
      setBusy(false);
    }
  }

  async function startChapa(method: "chapa" | "telebirr") {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/checkout/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ softwareId, method }),
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Payment failed");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setBusy(false);
    }
  }

  async function devGrant() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/checkout/dev-grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ softwareId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Grant failed");
        return;
      }
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  async function startDownload() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/software/${softwareId}/download-token`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string; downloadUrl?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Could not start download");
        return;
      }
      if (data.downloadUrl) {
        window.location.href = data.downloadUrl;
      }
    } finally {
      setBusy(false);
    }
  }

  const etbHint =
    priceCents > 0
      ? currency.toLowerCase() === "etb"
        ? `ETB ${(priceCents / 100).toFixed(0)}`
        : "ETB via Chapa"
      : null;

  if (!hasSession) {
    return (
      <div
        className={
          embedded
            ? "space-y-4"
            : "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"
        }
      >
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
            Sign in to download
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-[var(--muted)]">
            Free and licensed access is issued to your account. Pay with Stripe or
            Chapa / Telebirr when configured.
          </p>
        </div>
        <Link
          href={`/auth/login?next=/software/${softwareId}`}
          className={`inline-flex h-11 w-full items-center justify-center rounded-xl bg-orange-600 px-6 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-500 dark:bg-[var(--accent)] dark:shadow-[var(--accent-glow)] dark:hover:bg-[var(--accent-hover)] ${
            embedded ? "" : "mt-4 shrink-0 sm:mt-0 sm:w-auto"
          }`}
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-4" : "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"}>
      <div className={embedded ? "space-y-4" : "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"}>
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
            {entitled || isOwner
              ? hosted
                ? "Cloud access"
                : canDownload
                  ? "Download"
                  : "Access"
              : needsPurchase
                ? "Purchase required"
                : hosted
                  ? "Cloud access"
                  : "Download"}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-[var(--muted)]">
            {entitled || isOwner
              ? accessHint
              : needsPurchase
                ? "Stripe (global) or Chapa / Telebirr (Ethiopia) when enabled."
                : "Sign in required."}
            {requiresLicenseKeyAtRuntime(distributionType) && (entitled || isOwner) ? (
              <span className="block mt-1">
                License key available in{" "}
                <Link href="/app/my-software" className="font-semibold text-orange-600 underline-offset-2 hover:underline dark:text-[var(--accent)]">
                  My software
                </Link>
                .
              </span>
            ) : null}
            {etbHint ? ` · ${etbHint}` : null}
          </p>
          {message ? (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{message}</p>
          ) : null}
        </div>

        <div className={`flex flex-col gap-2.5 ${embedded ? "w-full" : "flex-wrap sm:flex-row sm:items-center sm:gap-3"}`}>
          {needsPurchase && canBuyStripe ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void startCheckout()}
              className={`inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-6 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-500 disabled:opacity-60 dark:bg-[var(--accent)] dark:shadow-[var(--accent-glow)] dark:hover:bg-[var(--accent-hover)] ${
                embedded ? "w-full" : "shrink-0"
              }`}
            >
              {busy ? "…" : "Pay with Stripe"}
            </button>
          ) : null}

          {canBuyChapa ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void startChapa("chapa")}
              className={`inline-flex h-11 items-center justify-center rounded-xl border border-emerald-600/40 bg-emerald-50 px-6 text-sm font-semibold text-emerald-800 disabled:opacity-60 dark:bg-emerald-600/10 dark:text-emerald-200 ${
                embedded ? "w-full" : "shrink-0"
              }`}
            >
              {busy ? "…" : "Pay with Chapa"}
            </button>
          ) : null}

          {canBuyChapa && telebirrEnabled ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void startChapa("telebirr")}
              className={`inline-flex h-11 items-center justify-center rounded-xl border border-sky-600/40 bg-sky-50 px-6 text-sm font-semibold text-sky-900 disabled:opacity-60 dark:bg-sky-600/10 dark:text-sky-200 ${
                embedded ? "w-full" : "shrink-0"
              }`}
            >
              {busy ? "…" : "Telebirr"}
            </button>
          ) : null}

          {needsPurchase && !canBuyStripe && !canBuyChapa && !showDevGrant ? (
            <p className="text-xs text-[var(--muted)]">
              {stripeConfigured
                ? "Add stripePriceId or CHAPA_SECRET_KEY to enable checkout."
                : "Configure STRIPE_SECRET_KEY or CHAPA_SECRET_KEY for payments."}
            </p>
          ) : null}

          {showDevGrant ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void devGrant()}
              className={`inline-flex h-11 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-50 px-6 text-sm font-semibold text-amber-900 disabled:opacity-60 dark:bg-amber-500/10 dark:text-amber-200 ${
                embedded ? "w-full" : "shrink-0"
              }`}
            >
              {busy ? "…" : "Dev: grant license"}
            </button>
          ) : null}

          {(entitled || isOwner) && hosted && hostedAppUrl ? (
            <a
              href={hostedAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-6 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-500 dark:bg-[var(--accent)] dark:shadow-[var(--accent-glow)] dark:hover:bg-[var(--accent-hover)] ${
                embedded ? "w-full" : "shrink-0"
              }`}
            >
              Open cloud app
            </a>
          ) : null}

          {(entitled || isOwner) && hosted && !hostedAppUrl ? (
            <Link
              href={`/app/my-software/${softwareId}`}
              className={`inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 text-sm font-semibold text-[var(--foreground)] ${
                embedded ? "w-full" : "shrink-0"
              }`}
            >
              View in library
            </Link>
          ) : null}

          {(entitled || isOwner) && canDownload ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void startDownload()}
              className={`inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-6 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-500 disabled:opacity-60 dark:bg-[var(--accent)] dark:shadow-[var(--accent-glow)] dark:hover:bg-[var(--accent-hover)] ${
                embedded ? "w-full" : "shrink-0"
              }`}
            >
              {busy ? "…" : distributionType === "SOURCE_CODE" ? "Download source" : "Download"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
