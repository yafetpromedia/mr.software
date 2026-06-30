"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StorefrontTheme } from "@prisma/client";
import { normalizeHandle } from "@/lib/storefront/handles";
import {
  SOCIAL_PLATFORM_IDS,
  SOCIAL_PLATFORM_META,
  type SocialPlatformId,
  type StorefrontSocialLinks,
} from "@/lib/storefront/social-links";
import { STOREFRONT_THEMES } from "@/lib/storefront/themes";
import type { OwnStorefront } from "@/lib/storefront/storefront";
import { BRAND_DOMAIN } from "@/lib/branding/constants";

type Props = {
  initial: OwnStorefront | null;
};

function emptySocialFormState(links?: StorefrontSocialLinks): Record<SocialPlatformId, string> {
  return Object.fromEntries(
    SOCIAL_PLATFORM_IDS.map((id) => [id, links?.[id] ?? ""]),
  ) as Record<SocialPlatformId, string>;
}

export function StorefrontSettingsForm({ initial }: Props) {
  const router = useRouter();
  const [handle, setHandle] = useState(initial?.handle ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [socialLinks, setSocialLinks] = useState(() => emptySocialFormState(initial?.socialLinks));
  const [theme, setTheme] = useState<StorefrontTheme>(initial?.theme ?? "CLASSIC");
  const [showRevenuePublic, setShowRevenuePublic] = useState(initial?.showRevenuePublic ?? false);
  const [saved, setSaved] = useState<OwnStorefront | null>(initial);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const previewHandle = useMemo(() => normalizeHandle(handle), [handle]);
  const publicUrl = saved?.publicUrl ?? (previewHandle ? `/@${previewHandle}` : null);
  const activeTheme = STOREFRONT_THEMES.find((t) => t.id === theme) ?? STOREFRONT_THEMES[0];

  useEffect(() => {
    if (!previewHandle || previewHandle.length < 3) {
      setAvailable(null);
      return;
    }
    if (saved?.handle === previewHandle) {
      setAvailable(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setChecking(true);
      void fetch(`/api/storefront/check?handle=${encodeURIComponent(previewHandle)}`)
        .then((res) => res.json())
        .then((data: { available?: boolean }) => setAvailable(Boolean(data.available)))
        .catch(() => setAvailable(null))
        .finally(() => setChecking(false));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [previewHandle, saved?.handle]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const res = await fetch("/api/storefront", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          handle,
          tagline,
          bio,
          website,
          socialLinks,
          theme,
          showRevenuePublic,
        }),
      });
      const data = (await res.json()) as { error?: string; storefront?: OwnStorefront };
      if (!res.ok || !data.storefront) {
        throw new Error(data.error ?? "Failed to save storefront");
      }
      setSaved(data.storefront);
      setHandle(data.storefront.handle);
      setSocialLinks(emptySocialFormState(data.storefront.socialLinks));
      setTheme(data.storefront.theme);
      setShowRevenuePublic(data.storefront.showRevenuePublic);
      setStatus("Storefront saved. Your public page is live.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSave(e)} className="space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4">
        <p className="text-xs font-medium text-[var(--muted)]">Public URL</p>
        <p className="mt-1 font-mono text-sm text-[var(--foreground)]">
          {publicUrl ? (
            <Link href={publicUrl} className="text-[var(--accent)] hover:underline">
              {BRAND_DOMAIN}{publicUrl}
            </Link>
          ) : (
            "Set a handle below"
          )}
        </p>
        {saved?.verified ? (
          <p className="mt-2 text-xs font-medium text-sky-600 dark:text-sky-400">
            Verified creator — badge shown on your store
          </p>
        ) : null}
        {saved?.featured ? (
          <p className="mt-2 text-xs font-medium text-[var(--accent)]">Featured creator storefront</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="sf-handle" className="text-xs font-medium text-[var(--muted)]">
          Store handle *
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-[var(--muted)]">@</span>
          <input
            id="sf-handle"
            required
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            placeholder="yafetpromedia"
          />
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {checking
            ? "Checking availability..."
            : available === true
              ? "Handle is available"
              : available === false
                ? "Handle is taken or invalid"
                : "Lowercase letters, numbers, hyphens, underscores"}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-[var(--muted)]">Store theme</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {STOREFRONT_THEMES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={`rounded-xl border p-3 text-left transition ${
                theme === option.id
                  ? "border-[var(--accent)] bg-[var(--accent-muted)]/40 ring-1 ring-[var(--accent)]/30"
                  : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/30"
              }`}
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{option.label}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{option.description}</p>
            </button>
          ))}
        </div>
        <div className={`mt-3 overflow-hidden rounded-xl border border-[var(--border)] ${activeTheme.page}`}>
          <div className={`px-4 py-3 text-sm font-medium ${activeTheme.header}`}>
            Theme preview — {activeTheme.label}
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4">
        <input
          type="checkbox"
          checked={showRevenuePublic}
          onChange={(e) => setShowRevenuePublic(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[var(--border)]"
        />
        <span>
          <span className="block text-sm font-medium text-[var(--foreground)]">
            Show lifetime revenue on my store
          </span>
          <span className="mt-0.5 block text-xs text-[var(--muted)]">
            Displays total sales from active purchases. You can turn this off anytime.
          </span>
        </span>
      </label>

      <div>
        <label htmlFor="sf-tagline" className="text-xs font-medium text-[var(--muted)]">
          Tagline
        </label>
        <input
          id="sf-tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
          placeholder="Building education SaaS for Africa"
        />
      </div>

      <div>
        <label htmlFor="sf-bio" className="text-xs font-medium text-[var(--muted)]">
          Bio
        </label>
        <textarea
          id="sf-bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
          placeholder="Tell customers what you build and who you serve."
        />
      </div>

      <div>
        <label htmlFor="sf-website" className="text-xs font-medium text-[var(--muted)]">
          Website
        </label>
        <input
          id="sf-website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
          placeholder="yafetpromedia.com"
        />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">Social profiles</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Add links so visitors can follow you on other platforms. Icons appear on your public store.
        </p>
        <div className="mt-4 space-y-3">
          {SOCIAL_PLATFORM_IDS.map((id) => {
            const meta = SOCIAL_PLATFORM_META[id];
            return (
              <div key={id}>
                <label htmlFor={`sf-social-${id}`} className="text-xs font-medium text-[var(--muted)]">
                  {meta.label}
                </label>
                <input
                  id={`sf-social-${id}`}
                  value={socialLinks[id]}
                  onChange={(e) =>
                    setSocialLinks((prev) => ({ ...prev, [id]: e.target.value }))
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                  placeholder={meta.placeholder}
                />
                <p className="mt-0.5 text-[0.65rem] text-[var(--muted)]">{meta.hint}</p>
              </div>
            );
          })}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}

      <button
        type="submit"
        disabled={saving || available === false}
        className="inline-flex h-10 items-center rounded-xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Update storefront" : "Create storefront"}
      </button>
    </form>
  );
}
