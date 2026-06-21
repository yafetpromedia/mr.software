import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOwnershipRecordByNumber } from "@/lib/trust/ownership-record";
import { licenseTierLabel, OPEN_SOURCE_LABELS } from "@/lib/trust/license-types";
import { formatFingerprintShort } from "@/lib/trust/fingerprint";

type Props = { params: Promise<{ recordNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { recordNumber } = await params;
  return {
    title: `Ownership record ${recordNumber}`,
    description: "Mr.Software timestamped ownership record for published software.",
  };
}

export default async function OwnershipRecordPage({ params }: Props) {
  const { recordNumber } = await params;
  const record = await getOwnershipRecordByNumber(decodeURIComponent(recordNumber));
  if (!record) notFound();

  const tierLabel = licenseTierLabel(record.software.licenseTier);
  const osLabel = record.software.openSourceLicense
    ? OPEN_SOURCE_LABELS[record.software.openSourceLicense]
    : null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] border-t border-stone-200 bg-[var(--background)] dark:border-[var(--border)]">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link
          href="/marketplace"
          className="text-sm font-medium text-stone-500 transition hover:text-orange-600 dark:text-[var(--muted)] dark:hover:text-[var(--accent)]"
        >
          ← Marketplace
        </Link>

        <article className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[var(--shadow-card)] dark:border-[var(--border)] dark:bg-[var(--surface)]">
          <header className="border-b border-stone-100 bg-gradient-to-br from-orange-50 to-white px-8 py-10 dark:border-[var(--border)] dark:from-[var(--accent)]/10 dark:to-[var(--surface)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-[var(--accent)]">
              Mr.Software Ownership Record
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-3xl">
              Proof of creator
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-[var(--muted)]">
              Level 1 trust — timestamped record when software was published on Mr.Software.
            </p>
          </header>

          <dl className="divide-y divide-stone-100 dark:divide-[var(--border)]">
            {[
              ["Record ID", record.recordNumber],
              ["Developer", record.developerName],
              ["Product", record.productName],
              ["Published", record.publishedAt.toLocaleDateString(undefined, { dateStyle: "long" })],
              ["License tier", tierLabel],
              ...(osLabel ? [["Open-source license", osLabel] as const] : []),
              ...(record.software.contentFingerprint
                ? [["Fingerprint", formatFingerprintShort(record.software.contentFingerprint, 16)] as const]
                : []),
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 px-8 py-5 sm:grid-cols-[10rem_1fr]">
                <dt className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                  {label}
                </dt>
                <dd className="font-medium text-stone-900 dark:text-[var(--foreground)]">{value}</dd>
              </div>
            ))}
          </dl>

          <footer className="border-t border-stone-100 bg-stone-50 px-8 py-6 text-xs leading-relaxed text-stone-500 dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--muted)]">
            This is not a patent or government registration. It is a platform timestamp showing that the
            named developer published this product on Mr.Software. Intellectual property rights remain with
            the creator.
          </footer>
        </article>
      </div>
    </div>
  );
}
