"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PricingModel, SoftwareCategory } from "@prisma/client";
import { SOFTWARE_CATEGORIES, SOFTWARE_CATEGORY_LABELS } from "@/lib/marketplace/categories";

type Props = {
  defaultCurrency?: string;
};

function formatPriceLabel(
  pricingModel: PricingModel,
  amount: string,
  currency: string,
): { price: string; priceCents: number } {
  if (pricingModel === "FREE") {
    return { price: "Free", priceCents: 0 };
  }

  const parsed = Number.parseFloat(amount.replace(/,/g, ""));
  const priceCents = Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0;
  const cur = currency.trim().toLowerCase();

  if (!amount.trim()) {
    return { price: pricingModel === "SUBSCRIPTION" ? "Paid/mo" : "Paid", priceCents };
  }

  const displayAmount = amount.trim();
  if (cur === "usd") {
    const label =
      pricingModel === "SUBSCRIPTION" ? `$${displayAmount}/mo` : `$${displayAmount}`;
    return { price: label, priceCents };
  }

  const upper = cur.toUpperCase();
  const label =
    pricingModel === "SUBSCRIPTION"
      ? `${displayAmount} ${upper}/mo`
      : `${displayAmount} ${upper}`;
  return { price: label, priceCents };
}

export function ListingCreateForm({ defaultCurrency = "etb" }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SoftwareCategory>("DEVELOPER_TOOLS");
  const [pricingModel, setPricingModel] = useState<PricingModel>("ONE_TIME");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [assetUrl, setAssetUrl] = useState("");
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  const [appStoreUrl, setAppStoreUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Product name is required");
      setSaving(false);
      return;
    }

    const { price, priceCents } = formatPriceLabel(pricingModel, amount, currency);

    try {
      const res = await fetch("/api/software", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim(),
          category,
          pricingModel,
          price,
          priceCents,
          currency: currency.trim().toLowerCase(),
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          assetUrl: assetUrl.trim() || undefined,
          playStoreUrl: playStoreUrl.trim() || undefined,
          appStoreUrl: appStoreUrl.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { error?: string; id?: string; name?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to publish listing");
      }

      setStatus(`“${data.name ?? trimmedName}” is live on the marketplace.`);
      setName("");
      setDescription("");
      setAmount("");
      setThumbnailUrl("");
      setAssetUrl("");
      setPlayStoreUrl("");
      setAppStoreUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  const paid = pricingModel !== "FREE";

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="listing-name" className="text-xs font-medium text-[var(--muted)]">
            Product name *
          </label>
          <input
            id="listing-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            placeholder="School Management Pro"
            maxLength={120}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="listing-desc" className="text-xs font-medium text-[var(--muted)]">
            Description *
          </label>
          <textarea
            id="listing-desc"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            placeholder="What it does, who it is for, and what buyers get."
          />
        </div>

        <div>
          <label htmlFor="listing-category" className="text-xs font-medium text-[var(--muted)]">
            Category
          </label>
          <select
            id="listing-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as SoftwareCategory)}
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
          >
            {SOFTWARE_CATEGORIES.map((key) => (
              <option key={key} value={key}>
                {SOFTWARE_CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="listing-pricing" className="text-xs font-medium text-[var(--muted)]">
            Pricing model
          </label>
          <select
            id="listing-pricing"
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value as PricingModel)}
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
          >
            <option value="FREE">Free</option>
            <option value="ONE_TIME">One-time purchase</option>
            <option value="SUBSCRIPTION">Subscription</option>
          </select>
        </div>

        {paid ? (
          <>
            <div>
              <label htmlFor="listing-amount" className="text-xs font-medium text-[var(--muted)]">
                Price {pricingModel === "SUBSCRIPTION" ? "(per month)" : ""}
              </label>
              <input
                id="listing-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                placeholder={pricingModel === "SUBSCRIPTION" ? "29" : "499"}
              />
            </div>
            <div>
              <label htmlFor="listing-currency" className="text-xs font-medium text-[var(--muted)]">
                Currency
              </label>
              <select
                id="listing-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
              >
                <option value="etb">ETB</option>
                <option value="usd">USD</option>
              </select>
            </div>
          </>
        ) : null}

        <div className="sm:col-span-2">
          <label htmlFor="listing-thumb" className="text-xs font-medium text-[var(--muted)]">
            Cover image URL
          </label>
          <input
            id="listing-thumb"
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            placeholder="https://…"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="listing-asset" className="text-xs font-medium text-[var(--muted)]">
            Download or demo URL
          </label>
          <input
            id="listing-asset"
            type="url"
            value={assetUrl}
            onChange={(e) => setAssetUrl(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            placeholder="Optional — or deploy a build from Deploy"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            Buyers get this link after purchase. You can also host a static build via{" "}
            <span className="font-medium text-[var(--foreground)]">Deploy</span> after listing.
          </p>
        </div>

        <div>
          <label htmlFor="listing-play" className="text-xs font-medium text-[var(--muted)]">
            Google Play URL
          </label>
          <input
            id="listing-play"
            type="url"
            value={playStoreUrl}
            onChange={(e) => setPlayStoreUrl(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            placeholder="Optional"
          />
        </div>

        <div>
          <label htmlFor="listing-appstore" className="text-xs font-medium text-[var(--muted)]">
            App Store URL
          </label>
          <input
            id="listing-appstore"
            type="url"
            value={appStoreUrl}
            onChange={(e) => setAppStoreUrl(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            placeholder="Optional"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
          {status}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="btn-brand btn-brand-shine inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Publishing…" : "Publish to marketplace"}
      </button>
    </form>
  );
}
