import Link from "next/link";
import type { SoftwareItem } from "@/lib/software-item";
import { LICENSE_TIER_META } from "@/lib/trust/license-types";
import { DISTRIBUTION_TYPE_META } from "@/lib/trust/distribution-types";

type Props = {
  item: SoftwareItem;
};

export function SoftwareTrustPanel({ item }: Props) {
  if (
    !item.licenseTier &&
    !item.distributionType &&
    !item.ownershipRecordNumber &&
    !item.contentFingerprint
  ) {
    return null;
  }

  const tierMeta = item.licenseTier
    ? LICENSE_TIER_META[item.licenseTier as keyof typeof LICENSE_TIER_META]
    : undefined;
  const distributionMeta = item.distributionType
    ? DISTRIBUTION_TYPE_META[item.distributionType as keyof typeof DISTRIBUTION_TYPE_META]
    : undefined;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-[var(--border)] dark:bg-[var(--surface)] sm:p-8">
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-[var(--muted)]">
        Trust & licensing
      </h2>
      <p className="mt-2 text-sm text-stone-600 dark:text-[var(--muted)]">
        Mr.Software protects creators and buyers with ownership records, license keys, and verification.
      </p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {tierMeta ? (
          <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-4 dark:border-[var(--border)] dark:bg-[var(--background)]">
            <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
              License
            </dt>
            <dd className="mt-1 text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
              {tierMeta.label}
            </dd>
            <dd className="mt-0.5 text-xs text-stone-500 dark:text-[var(--muted)]">{tierMeta.summary}</dd>
            {item.openSourceLicense ? (
              <dd className="mt-1 text-xs font-medium text-orange-600 dark:text-[var(--accent)]">
                {item.openSourceLicense}
              </dd>
            ) : null}
          </div>
        ) : null}

        {distributionMeta ? (
          <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-4 dark:border-[var(--border)] dark:bg-[var(--background)]">
            <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
              Distribution
            </dt>
            <dd className="mt-1 text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
              {distributionMeta.label}
            </dd>
            <dd className="mt-0.5 text-xs text-stone-500 dark:text-[var(--muted)]">
              {distributionMeta.summary} · {distributionMeta.protection}
            </dd>
          </div>
        ) : null}

        {item.ownershipRecordNumber ? (
          <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-4 dark:border-[var(--border)] dark:bg-[var(--background)]">
            <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
              Ownership record
            </dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-stone-900 dark:text-[var(--foreground)]">
              {item.ownershipRecordNumber}
            </dd>
            <dd className="mt-1">
              <Link
                href={`/trust/ownership/${encodeURIComponent(item.ownershipRecordNumber)}`}
                className="text-xs font-semibold text-orange-600 hover:underline dark:text-[var(--accent)]"
              >
                View public record →
              </Link>
            </dd>
          </div>
        ) : null}

        {item.contentFingerprint ? (
          <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-4 sm:col-span-2 dark:border-[var(--border)] dark:bg-[var(--background)]">
            <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
              Product fingerprint
            </dt>
            <dd className="mt-1 font-mono text-sm text-stone-800 dark:text-[var(--foreground)]">
              {item.contentFingerprint}
            </dd>
            <dd className="mt-1 text-xs text-stone-500 dark:text-[var(--muted)]">
              SHA-256 signature at publish time — proves who uploaded and when.
            </dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-stone-500 dark:text-[var(--muted)]">
        Intellectual property remains with the developer. Mr.Software receives only a limited license to
        host, display, distribute, and process transactions.
      </p>
    </div>
  );
}
