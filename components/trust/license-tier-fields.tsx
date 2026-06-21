"use client";

import type { OpenSourceLicense, ProductLicenseTier } from "@prisma/client";
import {
  LICENSE_TIER_META,
  OPEN_SOURCE_LABELS,
  OPEN_SOURCE_LICENSES,
  PRODUCT_LICENSE_TIERS,
} from "@/lib/trust/license-types";

type Props = {
  licenseTier: ProductLicenseTier;
  openSourceLicense: OpenSourceLicense;
  onLicenseTierChange: (tier: ProductLicenseTier) => void;
  onOpenSourceLicenseChange: (license: OpenSourceLicense) => void;
};

export function LicenseTierFields({
  licenseTier,
  openSourceLicense,
  onLicenseTierChange,
  onOpenSourceLicenseChange,
}: Props) {
  const meta = LICENSE_TIER_META[licenseTier];

  return (
    <div className="space-y-4 sm:col-span-2">
      <div>
        <p className="text-xs font-medium text-[var(--muted)]">License type *</p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          Every product on Mr.Software has a license. Buyers receive a verifiable key after purchase.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PRODUCT_LICENSE_TIERS.map((tier) => {
            const tierMeta = LICENSE_TIER_META[tier];
            const selected = licenseTier === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => onLicenseTierChange(tier)}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/30"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/40"
                }`}
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">{tierMeta.label}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{tierMeta.summary}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">{meta.hint}</p>
      </div>

      {licenseTier === "OPEN_SOURCE" ? (
        <div>
          <label htmlFor="listing-os-license" className="text-xs font-medium text-[var(--muted)]">
            Open-source license template
          </label>
          <select
            id="listing-os-license"
            value={openSourceLicense}
            onChange={(e) => onOpenSourceLicenseChange(e.target.value as OpenSourceLicense)}
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
          >
            {OPEN_SOURCE_LICENSES.map((key) => (
              <option key={key} value={key}>
                {OPEN_SOURCE_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
