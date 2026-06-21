import { AdminReportsPanel } from "@/components/admin/admin-reports-panel";

export const metadata = {
  title: "Reports",
  description: "User reports and abuse queue",
};

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Reports
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Triage listing abuse, misleading storefronts, and account issues. Actions are logged in
          the audit trail — pair with{" "}
          <span className="font-mono text-xs">/admin/moderation</span> for enforcement.
        </p>
      </div>
      <AdminReportsPanel />
    </div>
  );
}
