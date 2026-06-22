"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Rocket,
  Trash2,
} from "lucide-react";
import type { PricingModel, SoftwareCategory } from "@prisma/client";
import { parseJsonResponse } from "@/lib/http/parse-json-response";
import { ListingEditDialog } from "@/components/app/listing-edit-dialog";
import { ListingPreviewDialog } from "@/components/app/listing-preview-dialog";

export type DeveloperListingRow = {
  id: string;
  name: string;
  description: string;
  price: string;
  pricingModel: PricingModel;
  priceCents: number;
  currency: string;
  category: SoftwareCategory;
  categoryLabel: string;
  thumbnailUrl: string | null;
  published: boolean;
};

export function DeveloperListingsPanel({
  initialListings,
}: {
  initialListings: DeveloperListingRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialListings);
  const [preview, setPreview] = useState<DeveloperListingRow | null>(null);
  const [edit, setEdit] = useState<DeveloperListingRow | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  function openPreview(listing: DeveloperListingRow) {
    setMenuOpen(null);
    setPreview(listing);
  }

  function openEdit(listing: DeveloperListingRow) {
    setMenuOpen(null);
    setPreview(null);
    setEdit(listing);
  }

  async function togglePublished(listing: DeveloperListingRow) {
    setBusyId(listing.id);
    setMessage(null);
    setMenuOpen(null);
    try {
      const res = await fetch(`/api/software/${listing.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ published: !listing.published }),
      });
      const data = await parseJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setRows((r) =>
        r.map((x) => (x.id === listing.id ? { ...x, published: !x.published } : x)),
      );
      setMessage({
        text: listing.published ? "Listing hidden from marketplace" : "Listing is live again",
        ok: true,
      });
      router.refresh();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Update failed", ok: false });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteListing(listing: DeveloperListingRow) {
    setMenuOpen(null);
    const ok = window.confirm(
      `Delete “${listing.name}”? This cannot be undone. Products with active buyers must be hidden instead.`,
    );
    if (!ok) return;

    setBusyId(listing.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/software/${listing.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setRows((r) => r.filter((x) => x.id !== listing.id));
      setPreview((p) => (p?.id === listing.id ? null : p));
      setMessage({ text: "Listing deleted", ok: true });
      router.refresh();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Delete failed", ok: false });
    } finally {
      setBusyId(null);
    }
  }

  function handleSaved(updated: DeveloperListingRow) {
    setRows((r) => r.map((x) => (x.id === updated.id ? updated : x)));
    setPreview((p) => (p?.id === updated.id ? updated : p));
    setMessage({ text: "Listing updated", ok: true });
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
        No products yet. Use the form above to publish your first listing.
      </p>
    );
  }

  return (
    <>
      {message ? (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
          }`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}

      <ul className="space-y-3">
        {rows.map((s) => {
          const busy = busyId === s.id;
          return (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[var(--foreground)]">{s.name}</p>
                  {!s.published ? (
                    <span className="rounded-full border border-stone-300 bg-stone-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-stone-600 dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--muted)]">
                      Hidden
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  {s.price} · {s.categoryLabel} · {s.pricingModel.replace("_", " ").toLowerCase()}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ${
                    s.published
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                      : "border border-stone-300 bg-stone-100 text-stone-600 dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--muted)]"
                  }`}
                >
                  {s.published ? "Live on marketplace" : "Not public"}
                </span>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => openPreview(s)}
                  className="inline-flex h-8 items-center rounded-full border border-[var(--border)] px-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40 disabled:opacity-50"
                >
                  View listing
                </button>

                <Link
                  href={`/deploy?source=import&listing=${s.id}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
                >
                  <Rocket className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
                  Deploy
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    disabled={busy}
                    aria-expanded={menuOpen === s.id}
                    aria-haspopup="menu"
                    onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)] disabled:opacity-50"
                    aria-label="Listing actions"
                  >
                    <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                  </button>

                  {menuOpen === s.id ? (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default"
                        aria-label="Close menu"
                        onClick={() => setMenuOpen(null)}
                      />
                      <ul
                        role="menu"
                        className="absolute right-0 top-full z-20 mt-1 min-w-[10.5rem] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
                      >
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => openEdit(s)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--accent-muted)]/40"
                          >
                            <Pencil className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} />
                            Edit listing
                          </button>
                        </li>
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => void togglePublished(s)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--accent-muted)]/40"
                          >
                            {s.published ? (
                              <EyeOff className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.75} />
                            ) : (
                              <Eye className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} />
                            )}
                            {s.published ? "Hide from marketplace" : "Show on marketplace"}
                          </button>
                        </li>
                        <li role="none" className="border-t border-[var(--border)]">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => void deleteListing(s)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            Delete listing
                          </button>
                        </li>
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ListingPreviewDialog
        listing={preview}
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        onEdit={() => {
          if (preview) openEdit(preview);
        }}
      />

      <ListingEditDialog
        listing={edit}
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        onSaved={handleSaved}
      />
    </>
  );
}
