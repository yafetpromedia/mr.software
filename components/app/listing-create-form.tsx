"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { PricingModel, SoftwareCategory, ProductLicenseTier, OpenSourceLicense, DistributionType, ProductKind } from "@prisma/client";
import { SOFTWARE_CATEGORIES, SOFTWARE_CATEGORY_LABELS } from "@/lib/marketplace/categories";
import { PRODUCT_KINDS, PRODUCT_KIND_LABELS } from "@/lib/marketplace/product-types";
import type { DeliveryPackageId } from "@/lib/marketplace/delivery-packages";
import { LicenseTierFields } from "@/components/trust/license-tier-fields";
import {
  defaultDeliveryPackageId,
  DeliveryPackageFields,
} from "@/components/trust/delivery-package-fields";
import Link from "next/link";
import { parseJsonResponse } from "@/lib/http/parse-json-response";

type InitialValues = {
  name?: string;
  description?: string;
  category?: SoftwareCategory;
  pricingModel?: PricingModel;
  amount?: string;
};

type Props = {
  defaultCurrency?: string;
  initial?: InitialValues;
  onSuccess?: (software: { id: string; name: string }) => void;
  submitLabel?: string;
  canUploadSource?: boolean;
  publishedCount?: number;
  maxPublishedProducts?: number | "unlimited";
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

export function ListingCreateForm({
  defaultCurrency = "etb",
  initial,
  onSuccess,
  submitLabel = "Publish to marketplace",
  canUploadSource = false,
  publishedCount = 0,
  maxPublishedProducts = 5,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<SoftwareCategory>(initial?.category ?? "DEVELOPER_TOOLS");
  const [pricingModel, setPricingModel] = useState<PricingModel>(initial?.pricingModel ?? "ONE_TIME");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [assetUrl, setAssetUrl] = useState("");
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  const [appStoreUrl, setAppStoreUrl] = useState("");
  const [licenseTier, setLicenseTier] = useState<ProductLicenseTier>("PERSONAL");
  const [openSourceLicense, setOpenSourceLicense] = useState<OpenSourceLicense>("MIT");
  const [distributionType, setDistributionType] = useState<DistributionType>("COMPILED");
  const [productKind, setProductKind] = useState<ProductKind>("WEBSITE");
  const [deliveryPackageId, setDeliveryPackageId] = useState<DeliveryPackageId>("compiled");
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
          licenseTier,
          openSourceLicense: licenseTier === "OPEN_SOURCE" ? openSourceLicense : undefined,
          distributionType,
          productKind,
        }),
      });

      const data = await parseJsonResponse<{ error?: string; id?: string; name?: string }>(res);
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to publish listing");
      }

      setStatus(`“${data.name ?? trimmedName}” is live on the marketplace.`);
      onSuccess?.({ id: data.id ?? "", name: data.name ?? trimmedName });
      if (!onSuccess) {
        setName("");
        setDescription("");
        setAmount("");
        setThumbnailUrl("");
        setAssetUrl("");
        setPlayStoreUrl("");
        setAppStoreUrl("");
        setLicenseTier("PERSONAL");
        setOpenSourceLicense("MIT");
        setDistributionType("COMPILED");
        setProductKind("WEBSITE");
        setDeliveryPackageId("compiled");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  const paid = pricingModel !== "FREE";

  async function onCoverFileChange(file?: File) {
    if (!file) return;
    setCoverUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/software/thumbnail/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await parseJsonResponse<{ error?: string; url?: string }>(res);
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Cover upload failed");
      }
      setThumbnailUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  function clearCover() {
    setThumbnailUrl("");
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  const coverPreview = thumbnailUrl.trim() || null;

  const atListingLimit =
    maxPublishedProducts !== "unlimited" && publishedCount >= maxPublishedProducts;

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      {maxPublishedProducts !== "unlimited" ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-xs text-[var(--muted)]">
          Free plan: {publishedCount}/{maxPublishedProducts} published products.{" "}
          {atListingLimit ? (
            <>
              Upgrade to{" "}
              <Link href="/payouts" className="font-semibold text-[var(--accent)] hover:underline">
                Pro
              </Link>{" "}
              for unlimited listings and source-code sales.
            </>
          ) : (
            "Compiled apps and demos are allowed on Free. Source-code (.zip) listings require Pro."
          )}
        </p>
      ) : null}

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
          <label htmlFor="listing-product-kind" className="text-xs font-medium text-[var(--muted)]">
            Project type
          </label>
          <select
            id="listing-product-kind"
            value={productKind}
            onChange={(e) => {
              const kind = e.target.value as ProductKind;
              setProductKind(kind);
              if (kind === "SOURCE_CODE" && canUploadSource) {
                setDeliveryPackageId("source");
                setDistributionType("SOURCE_CODE");
              }
            }}
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
          >
            {PRODUCT_KINDS.map((key) => (
              <option key={key} value={key} disabled={key === "SOURCE_CODE" && !canUploadSource}>
                {PRODUCT_KIND_LABELS[key]}
                {key === "SOURCE_CODE" && !canUploadSource ? " (Pro)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="listing-category" className="text-xs font-medium text-[var(--muted)]">
            Marketplace category
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

        <DeliveryPackageFields
          deliveryPackageId={deliveryPackageId}
          canUploadSource={canUploadSource}
          onChange={({ packageId, distributionType: nextType, pricingModel, licenseTier: nextTier }) => {
            setDeliveryPackageId(packageId);
            setDistributionType(nextType);
            if (pricingModel) setPricingModel(pricingModel);
            if (nextTier) setLicenseTier(nextTier);
            if (packageId === "source" || packageId === "source_commercial" || packageId === "source_lifetime") {
              setProductKind("SOURCE_CODE");
            }
          }}
        />

        <LicenseTierFields
          licenseTier={licenseTier}
          openSourceLicense={openSourceLicense}
          onLicenseTierChange={(tier) => {
            setLicenseTier(tier);
            setDeliveryPackageId(
              defaultDeliveryPackageId({
                distributionType,
                pricingModel,
                licenseTier: tier,
              }),
            );
          }}
          onOpenSourceLicenseChange={setOpenSourceLicense}
        />

        <div className="sm:col-span-2">
          <p className="text-xs font-medium text-[var(--muted)]">Cover image</p>
          <div className="mt-2 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
            {coverPreview ? (
              <div className="relative overflow-hidden rounded-xl border border-[var(--border)]">
                <div className="relative aspect-[16/9] w-full max-w-md bg-[var(--surface)]">
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    fill
                    unoptimized={coverPreview.startsWith("/")}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <button
                  type="button"
                  onClick={clearCover}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]/95 text-[var(--muted)] shadow-sm transition hover:text-[var(--foreground)]"
                  aria-label="Remove cover image"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="listing-cover-file"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition ${
                  coverUploading
                    ? "border-[var(--accent)]/40 bg-[var(--accent-muted)]/30"
                    : "border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-muted)]/20"
                }`}
              >
                {coverUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" strokeWidth={1.75} />
                ) : (
                  <ImagePlus className="h-8 w-8 text-[var(--accent)]" strokeWidth={1.75} />
                )}
                <span className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                  {coverUploading ? "Uploading…" : "Upload cover image"}
                </span>
                <span className="mt-1 text-xs text-[var(--muted)]">PNG, JPG, WebP, or GIF · max 5 MB</span>
              </label>
            )}

            <input
              ref={coverInputRef}
              id="listing-cover-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              disabled={coverUploading}
              onChange={(e) => void onCoverFileChange(e.target.files?.[0])}
            />

            {coverPreview ? (
              <button
                type="button"
                disabled={coverUploading}
                onClick={() => coverInputRef.current?.click()}
                className="text-sm font-medium text-[var(--accent)] hover:underline disabled:opacity-50"
              >
                Replace image
              </button>
            ) : null}

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                or paste URL
              </span>
              <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
            </div>

            <div>
              <label htmlFor="listing-thumb" className="sr-only">
                Cover image URL
              </label>
              <input
                id="listing-thumb"
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                placeholder="https://…"
              />
            </div>
          </div>
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
            placeholder={distributionType === "HOSTED" ? "Optional — deploy from Deploy after listing" : "Optional — or deploy a build from Deploy"}
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            {distributionType === "DEMO"
              ? "Demo-only products show a live preview — buyers do not download files."
              : distributionType === "HOSTED"
              ? "Hosted products run on MrSoftware ET Cloud. Buyers receive a URL — not source code or downloads."
              : distributionType === "COMPILED"
                ? "Buyers download a package and enter their license key at startup. Verify via POST /api/licenses/verify."
                : "Pro plan: buyers download your source ZIP after purchase. Include README, LICENSE, and install guide."}
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
        disabled={saving || atListingLimit}
        className="btn-brand btn-brand-shine inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Publishing…" : submitLabel}
      </button>
    </form>
  );
}
