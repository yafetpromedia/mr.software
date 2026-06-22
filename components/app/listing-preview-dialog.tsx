"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ExternalLink, Pencil, X } from "lucide-react";
import { resolveThumbnailUrl } from "@/lib/software-thumbnails";
import type { DeveloperListingRow } from "@/components/app/developer-listings-panel";

export function ListingPreviewDialog({
  listing,
  open,
  onClose,
  onEdit,
}: {
  listing: DeveloperListingRow | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
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

  if (!open || !listing) return null;

  const thumb = resolveThumbnailUrl(listing.thumbnailUrl, listing.id);
  const statusLabel = listing.published ? "Live on marketplace" : "Hidden from marketplace";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-preview-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="relative aspect-[16/9] w-full shrink-0 bg-[var(--background)]">
          <Image
            src={thumb}
            alt={`${listing.name} cover`}
            fill
            unoptimized={thumb.startsWith("/")}
            className="object-cover"
            sizes="512px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${
                listing.published
                  ? "bg-emerald-500/90 text-white"
                  : "bg-stone-500/90 text-white"
              }`}
            >
              {statusLabel}
            </span>
            <h2 id="listing-preview-title" className="mt-2 text-xl font-bold text-white">
              {listing.name}
            </h2>
            <p className="mt-1 text-sm text-white/85">
              {listing.price} · {listing.categoryLabel} ·{" "}
              {listing.pricingModel.replace("_", " ").toLowerCase()}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
            {listing.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] bg-[var(--background)]/50 p-4">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90 sm:flex-none"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
            Edit listing
          </button>
          <Link
            href={`/app/software/${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/35 sm:flex-none"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
            Open full page
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
