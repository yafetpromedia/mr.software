import { Suspense } from "react";
import { ReportPageForm } from "@/components/reports/report-page-form";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "Report a problem",
  description: "Report misleading listings, storefront abuse, or account issues on Mr.Software.",
};

export default async function ReportPage() {
  const session = await getSession();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full border-t border-stone-200 bg-[var(--background)] dark:border-[var(--border)]">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-red-600 dark:text-red-400">
          Trust &amp; safety
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-4xl">
          Report a problem
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-[var(--muted)]">
          Help keep the marketplace safe. Report spam, scams, copyright violations, misleading
          listings, or abusive storefronts. Our team reviews every submission.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-stone-600 dark:text-[var(--muted)]">
          <li className="flex gap-2">
            <span className="text-red-500" aria-hidden>
              •
            </span>
            Use the <strong className="font-semibold text-stone-800 dark:text-[var(--foreground)]">Report</strong>{" "}
            button on any listing or storefront for the fastest path.
          </li>
          <li className="flex gap-2">
            <span className="text-red-500" aria-hidden>
              •
            </span>
            Include links, screenshots described in text, and what outcome you expect.
          </li>
          <li className="flex gap-2">
            <span className="text-red-500" aria-hidden>
              •
            </span>
            False or repeated reports may lead to account restrictions.
          </li>
        </ul>

        <div className="mt-10">
          <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading form…</p>}>
            <ReportPageForm hasSession={Boolean(session)} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
