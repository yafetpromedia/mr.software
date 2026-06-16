"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import type { Partner } from "@/lib/landing/partners";

type SiteSettings = {
  logoUrl: string;
  partners: Partner[];
};

function emptyPartner(): Partner {
  return { name: "", logo: "", href: "", label: "" };
}

export function AdminSiteSettingsForm({
  initialSettings,
}: {
  initialSettings: SiteSettings;
}) {
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl);
  const [partners, setPartners] = useState<Partner[]>(
    initialSettings.partners.length > 0 ? initialSettings.partners : [emptyPartner()],
  );
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [partnerUploadingIndex, setPartnerUploadingIndex] = useState<number | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const canSave = useMemo(() => logoUrl.trim().startsWith("/"), [logoUrl]);

  function buildPayload(nextLogoUrl?: string, nextPartners?: Partner[]) {
    const sourcePartners = nextPartners ?? partners;
    return {
      logoUrl: (nextLogoUrl ?? logoUrl).trim(),
      partners: sourcePartners
        .map((p) => ({
          name: p.name?.trim() ?? "",
          logo: p.logo?.trim() ?? "",
          href: p.href?.trim() ?? "",
          label: p.label?.trim() ?? "",
        }))
        .filter((p) => p.name.length > 0),
    };
  }

  function broadcastLogoUpdate(nextLogoUrl: string) {
    window.dispatchEvent(
      new CustomEvent("mr:brand-logo-updated", {
        detail: { logoUrl: nextLogoUrl },
      }),
    );
  }

  async function persistSettings(payload: ReturnType<typeof buildPayload>) {
    const res = await fetch("/api/admin/site-settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? "Failed to save settings");
    }
  }

  async function uploadAsset(scope: "logo" | "partner", file: File): Promise<string> {
    const formData = new FormData();
    formData.set("scope", scope);
    formData.set("file", file);
    const res = await fetch("/api/admin/site-assets/upload", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as { error?: string; url?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error ?? "Upload failed");
    }
    return data.url;
  }

  function updatePartner(index: number, key: keyof Partner, value: string) {
    setPartners((prev) =>
      prev.map((p, i) =>
        i === index
          ? {
              ...p,
              [key]: value,
            }
          : p,
      ),
    );
  }

  function addPartner() {
    setPartners((prev) => [...prev, emptyPartner()]);
  }

  function removePartner(index: number) {
    setPartners((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSave() {
    setSaving(true);
    setStatus("");
    const payload = buildPayload();

    try {
      await persistSettings(payload);
      broadcastLogoUpdate(payload.logoUrl);
      setStatus("Saved. Landing page now reflects these settings.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error. Please retry.";
      setStatus(message);
    } finally {
      setSaving(false);
    }
  }

  async function onLogoFileChange(file?: File) {
    if (!file) return;
    setLogoUploading(true);
    setStatus("");
    try {
      const url = await uploadAsset("logo", file);
      setLogoUrl(url);
      await persistSettings(buildPayload(url));
      broadcastLogoUpdate(url);
      setStatus("Logo uploaded and applied.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logo upload failed";
      setStatus(message);
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function onPartnerFileChange(index: number, file?: File) {
    if (!file) return;
    setPartnerUploadingIndex(index);
    setStatus("");
    try {
      const url = await uploadAsset("partner", file);
      const nextPartners = partners.map((p, i) =>
        i === index
          ? {
              ...p,
              logo: url,
            }
          : p,
      );
      setPartners(nextPartners);
      await persistSettings(buildPayload(undefined, nextPartners));
      setStatus("Partner logo uploaded and applied.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Partner upload failed";
      setStatus(message);
    } finally {
      setPartnerUploadingIndex(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Brand logo
        </h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Use a public path, for example <code>/brand/logo-mark.png</code>.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={(e) => void onLogoFileChange(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            disabled={logoUploading}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoUploading ? "Uploading..." : "Upload logo file"}
          </button>
          <span className="text-xs text-[var(--muted)]">PNG, JPG, WEBP, SVG, GIF (max 5MB)</span>
        </div>
        <label className="mt-3 block text-xs font-medium text-[var(--muted)]">
          Logo URL
        </label>
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 transition focus:ring-2"
          placeholder="/brand/logo-mark.png"
        />
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-[var(--muted)]">Preview</p>
          {logoUrl.trim().length > 0 ? (
            <div className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] p-2">
              <Image
                src={logoUrl}
                alt="Brand logo preview"
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-contain"
              />
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)]">No logo selected yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Partnerships
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Add sponsor logos for the landing partnerships block.
            </p>
          </div>
          <button
            type="button"
            onClick={addPartner}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--background)]"
          >
            Add partner
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {partners.map((partner, index) => (
            <div key={`${index}-${partner.name}`} className="rounded-xl border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Name
                  </label>
                  <input
                    value={partner.name ?? ""}
                    onChange={(e) => updatePartner(index, "name", e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                    placeholder="Partner name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Accessible label (optional)
                  </label>
                  <input
                    value={partner.label ?? ""}
                    onChange={(e) => updatePartner(index, "label", e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                    placeholder="Partner full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Logo URL (optional)
                  </label>
                  <input
                    value={partner.logo ?? ""}
                    onChange={(e) => updatePartner(index, "logo", e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                    placeholder="/brand/partners/acme.svg"
                  />
                  <div className="mt-2">
                    <label className="inline-flex">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                        className="hidden"
                        onChange={(e) => void onPartnerFileChange(index, e.target.files?.[0])}
                      />
                      <span className="cursor-pointer rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--background)]">
                        {partnerUploadingIndex === index
                          ? "Uploading..."
                          : "Upload partner logo"}
                      </span>
                    </label>
                  </div>
                  <div className="mt-2">
                    <p className="mb-1 text-xs font-medium text-[var(--muted)]">
                      Preview
                    </p>
                    {partner.logo?.trim() ? (
                      <div className="inline-flex h-12 w-44 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] p-2">
                        <Image
                          src={partner.logo}
                          alt={partner.label?.trim() || partner.name?.trim() || "Partner logo preview"}
                          width={160}
                          height={40}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--muted)]">
                        No partner logo selected.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Website URL (optional)
                  </label>
                  <input
                    value={partner.href ?? ""}
                    onChange={(e) => updatePartner(index, "href", e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removePartner(index)}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!canSave || saving}
          onClick={() => void onSave()}
          className="inline-flex h-10 items-center rounded-xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save site settings"}
        </button>
        {status ? (
          <p className="text-sm text-[var(--muted)]">{status}</p>
        ) : null}
      </div>
    </div>
  );
}
