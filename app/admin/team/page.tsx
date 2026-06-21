import { AdminTeamPanel } from "@/components/admin/admin-team-panel";

export const metadata = {
  title: "Team",
};

export default function AdminTeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Team
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Manage the landing page team section — section copy and profiles. Use AI capability
          cards for tools and workflows, not branded product names as people.
        </p>
      </div>
      <AdminTeamPanel />
    </div>
  );
}
