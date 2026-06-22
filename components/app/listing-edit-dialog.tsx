"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { PricingModel, SoftwareCategory } from "@prisma/client";
import { SOFTWARE_CATEGORIES, SOFTWARE_CATEGORY_LABELS } from "@/lib/marketplace/categories";
import { parseJsonResponse } from "@/lib/http/parse-json-response";
import { resolveThumbnailUrl } from "@/lib/software-thumbnails";
import { LISTING_COVER_MAX_BYTES, LISTING_COVER_MAX_MB } from "@/lib/uploads/listing-cover-constants";
import type { DeveloperListingRow } from "@/components/app/developer-listings-panel";

function formatPriceLabel(
  pricingModel: PricingModel,
  amount: string,
  currency: string,
): { price: string; priceCents: number } {
  if (pricingModel === "FREE") return { price: "Free", priceCents: 0 };
  const parsed = Number.parseFloat(amount.replace(/,/g, ""));
  const priceCents = Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0;
  const cur = currency.trim().toLowerCase();
  if (!amount.trim()) {
    return { price: pricingModel === "SUBSCRIPTION" ? "Paid/mo" : "Paid", priceCents };
  }
  if (cur === "usd") {
    const label = pricingModel === "SUBSCRIPTION" ? `$${amount.trim()}/mo` : `$${amount.trim()}`;
    return { price: label, priceCents };
  }
  const upper = cur.toUpperCase();
  const label =
    pricingModel === "SUBSCRIPTION"
      ? `${amount.trim()} ${upper}/mo`
      : `${amount.trim()} ${upper}`;
  return { price: label, priceCents };
}

function amountFromListing(listing: DeveloperListingRow): string {
  if (listing.pricingModel === "FREE" || listing.priceCents === 0) return "";
  return String(listing.priceCents / 100);
}

export function ListingEditDialog({
  listing,
  open,
  onClose,
  onSaved,
}: {
  listing: DeveloperListingRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: DeveloperListingRow) => void;
}) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SoftwareCategory>("DEVELOPER_TOOLS");
  const [pricingModel, setPricingModel] = useState<PricingModel>("ONE_TIME");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("etb");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!listing || !open) return;
    setName(listing.name);
    setDescription(listing.description);
    setCategory(listing.category);
    setPricingModel(listing.pricingModel);
    setAmount(amountFromListing(listing));
    setCurrency(listing.currency || "etb");
    setThumbnailUrl(listing.thumbnailUrl ?? "");
    setError("");
  }, [listing, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function onCoverFileChange(file?: File) {
    if (!file) return;
    if (file.size > LISTING_COVER_MAX_BYTES) {
      setError(`Image must be ${LISTING_COVER_MAX_MB} MB or smaller`);
      return;
    }
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
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setThumbnailUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    setSaving(true);
    setError("");

    const { price, priceCents } = formatPriceLabel(pricingModel, amount, currency);

    try {
      const res = await fetch(`/api/software/${listing.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          pricingModel,
          price,
          priceCents,
          currency: currency.trim().toLowerCase(),
          thumbnailUrl: thumbnailUrl.trim() || null,
        }),
      });
      const data = await parseJsonResponse<{
        error?: string;
        item?: {
          id: string;
          name: string;
          description: string;
          price: string;
          pricingModel: PricingModel;
          priceCents: number;
          currency: string;
          categoryKey?: string;
          thumbnailUrl: string;
        };
      }>(res);
      if (!res.ok || !data.item) {
        throw new Error(data.error ?? "Could not save listing");
      }

      onSaved({
        ...listing,
        name: data.item.name,
        description: data.item.description,
        price: data.item.price,
        pricingModel: data.item.pricingModel,
        priceCents: data.item.priceCents,
        currency: data.item.currency,
        category: (data.item.categoryKey ?? category) as SoftwareCategory,
        categoryLabel: SOFTWARE_CATEGORY_LABELS[(data.item.categoryKey ?? category) as SoftwareCategory],
        thumbnailUrl: thumbnailUrl.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !listing) return null;

  const coverPreview = thumbnailUrl.trim()
    ? thumbnailUrl.trim()
    : resolveThumbnailUrl(listing.thumbnailUrl, listing.id);
  const paid = pricingModel !== "FREE";

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-edit-title"
    >
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 id="listing-edit-title" className="text-base font-semibold text-[var(--foreground)]">
            Edit listing
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <label htmlFor="edit-name" className="text-xs font-medium text-[var(--muted)]">Product name</label>
            <input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
          </div>
          <div>
            <label htmlFor="edit-desc" className="text-xs font-medium text-[var(--muted)]">Description</label>
            <textarea id="edit-desc" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-category" className="text-xs font-medium text-[var(--muted)]">Category</label>
              <select id="edit-category" value={category} onChange={(e) => setCategory(e.target.value as SoftwareCategory)} className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30">
                {SOFTWARE_CATEGORIES.map((key) => (
                  <option key={key} value={key}>{SOFTWARE_CATEGORY_LABELS[key]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-pricing" className="text-xs font-medium text-[var(--muted)]">Pricing</label>
              <select id="edit-pricing" value={pricingModel} onChange={(e) => setPricingModel(e.target.value as PricingModel)} className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30">
                <option value="FREE">Free</option>
                <option value="ONE_TIME">One-time</option>
                <option value="SUBSCRIPTION">Subscription</option>
              </select>
            </div>
          </div>
          {paid ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-amount" className="text-xs font-medium text-[var(--muted)]">Price</label>
                <input id="edit-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
              </div>
              <div>
                <label htmlFor="edit-currency" className="text-xs font-medium text-[var(--muted)]">Currency</label>
                <select id="edit-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/30">
                  <option value="etb">ETB</option>
                  <option value="usd">USD</option>
                </select>
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-medium text-[var(--muted)]">Cover image</p>
            <div className="mt-2 flex gap-3">
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[var(--border)]">
                <Image src={coverPreview} alt="" fill unoptimized={coverPreview.startsWith("/")} className="object-cover" sizes="128px" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <button type="button" disabled={coverUploading} onClick={() => coverInputRef.current?.click()} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 text-xs font-medium hover:border-[var(--accent)]/35">
                  {coverUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                  Upload new
                </button>
                <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => void onCoverFileChange(e.target.files?.[0])} />
                <input type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Or paste image URL" className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
              </div>
            </div>
          </div>

          {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex gap-2 border-t border-[var(--border)] p-4">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)]">Cancel</button>
          <button type="submit" disabled={saving || coverUploading} className="btn-brand ml-auto inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
