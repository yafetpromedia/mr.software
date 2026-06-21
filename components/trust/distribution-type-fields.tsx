"use client";

import type { DistributionType } from "@prisma/client";
import {
  DISTRIBUTION_TYPE_META,
  DISTRIBUTION_TYPES,
} from "@/lib/trust/distribution-types";

type Props = {
  distributionType: DistributionType;
  onChange: (type: DistributionType) => void;
};

export function DistributionTypeFields({ distributionType, onChange }: Props) {
  const meta = DISTRIBUTION_TYPE_META[distributionType];

  return (
    <div className="space-y-4 sm:col-span-2">
      <div>
        <p className="text-xs font-medium text-[var(--muted)]">Distribution *</p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          How buyers receive your product. Not every product is a downloadable file.
        </p>
        <div className="mt-3 grid gap-2">
          {DISTRIBUTION_TYPES.map((type) => {
            const typeMeta = DISTRIBUTION_TYPE_META[type];
            const selected = distributionType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange(type)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/30"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{typeMeta.label}</p>
                  <span className="rounded-md bg-[var(--surface)] px-2 py-0.5 text-[0.65rem] font-medium text-[var(--muted)]">
                    {typeMeta.protection}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{typeMeta.summary}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">{meta.hint}</p>
      </div>
    </div>
  );
}
