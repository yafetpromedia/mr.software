import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "User reports and escalations",
};

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Reports
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          In-app “report listing” and abuse queues will land here. There is no
          dedicated report model in the database yet; use{" "}
          <span className="font-mono text-xs">/admin/moderation</span> and user
          status tools for now.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-sm text-[var(--muted)] dark:bg-[var(--surface-elevated)]">
        <p className="font-medium text-[var(--foreground)]">Planned</p>
        <ul className="mt-4 list-inside list-disc space-y-2">
          <li>
            A <code className="rounded bg-[var(--background)] px-1.5 py-0.5 font-mono text-xs">
              UserReport
            </code>{" "}
            table (reporter, target listing, reason, state, admin resolution).
          </li>
          <li>Webhooks or email to ops for new open reports.</li>
        </ul>
      </div>
    </div>
  );
}
