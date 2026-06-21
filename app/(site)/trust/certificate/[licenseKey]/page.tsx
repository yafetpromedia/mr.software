import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/trust/print-button";
import { prisma } from "@/lib/prisma";
import { licenseTierLabel } from "@/lib/trust/license-types";

type Props = { params: Promise<{ licenseKey: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { licenseKey } = await params;
  return {
    title: `License certificate`,
    description: `Mr.Software license certificate for ${decodeURIComponent(licenseKey)}`,
  };
}

export default async function LicenseCertificatePage({ params }: Props) {
  const { licenseKey } = await params;
  const normalized = decodeURIComponent(licenseKey).trim().toUpperCase();

  const row = await prisma.softwareLicenseKey.findUnique({
    where: { licenseKey: normalized },
    include: {
      software: { select: { name: true, licenseTier: true } },
      user: { select: { name: true } },
    },
  });
  if (!row) notFound();

  const issued = row.issuedAt.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] border-t border-stone-200 bg-[var(--background)] print:border-0 print:bg-white dark:border-[var(--border)]">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 print:max-w-none print:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/app/my-software"
            className="text-sm font-medium text-stone-500 transition hover:text-orange-600 dark:text-[var(--muted)] dark:hover:text-[var(--accent)]"
          >
            ← My software
          </Link>
          <PrintButton />
        </div>

        <article className="overflow-hidden rounded-3xl border-2 border-stone-900 bg-white p-10 shadow-xl print:rounded-none print:border print:shadow-none dark:border-[var(--foreground)] dark:bg-[var(--surface)]">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-stone-500 dark:text-[var(--muted)]">
            Mr.Software
          </p>
          <h1 className="mt-4 text-center font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)]">
            License Certificate
          </h1>
          <p className="mt-2 text-center text-sm text-stone-600 dark:text-[var(--muted)]">
            Proof of purchase — Level 2 trust
          </p>

          <div className="my-10 border-y border-stone-200 py-8 dark:border-[var(--border)]">
            <dl className="mx-auto max-w-md space-y-5">
              {[
                ["Product", row.software.name],
                ["Owner", row.user.name],
                ["License type", licenseTierLabel(row.software.licenseTier)],
                ["License key", row.licenseKey],
                ["Status", row.status],
                ["Issued", issued],
                ...(row.expiresAt
                  ? [["Expires", row.expiresAt.toLocaleDateString(undefined, { dateStyle: "long" })] as const]
                  : []),
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                    {label}
                  </dt>
                  <dd
                    className={`mt-1 text-base font-semibold text-stone-900 dark:text-[var(--foreground)] ${
                      label === "License key" ? "font-mono text-sm" : ""
                    }`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-center text-xs leading-relaxed text-stone-500 dark:text-[var(--muted)]">
            Verify this license anytime via{" "}
            <span className="font-mono">POST /api/licenses/verify</span> with the license key.
          </p>
        </article>
      </div>
    </div>
  );
}
