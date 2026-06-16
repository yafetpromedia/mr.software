import type { Metadata } from "next";
import { MAX_ZIP_BYTES } from "@/lib/deploy/constants";

export const metadata: Metadata = {
  title: "System",
  description: "Limits and environment",
};

export default function AdminSystemPage() {
  const zipMb = MAX_ZIP_BYTES / (1024 * 1024);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          System
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Read-only guardrails and build-time configuration surfaced for
          operators. For secrets, use your host and secret manager, not this
          page.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm dark:bg-[var(--surface-elevated)]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Deploy uploads
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              MAX_ZIP_BYTES
            </dt>
            <dd className="mt-1 font-mono text-sm text-[var(--foreground)]">
              {MAX_ZIP_BYTES.toLocaleString()} ({zipMb} MB)
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Source
            </dt>
            <dd className="mt-1 font-mono text-xs text-[var(--foreground)]">
              lib/deploy/constants.ts
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)]/60 p-6 text-sm text-[var(--muted)]">
        <p className="font-medium text-[var(--foreground)]">Notes</p>
        <ul className="list-inside list-disc space-y-2">
          <li>
            Feature flags and runtime env are not yet centralized in this
            project; add a small <span className="font-mono text-xs">/admin</span>{" "}
            config read when you introduce them.
          </li>
          <li>
            Database health and job queues: use your process manager, hosted DB
            console, and application logs in production.
          </li>
        </ul>
      </div>
    </div>
  );
}
