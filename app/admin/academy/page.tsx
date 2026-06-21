import { AdminAcademyPanel } from "@/components/admin/admin-academy-panel";

export const metadata = {
  title: "Academy",
};

export default function AdminAcademyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Academy
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Manage courses, lessons, and the public academy page. Write rich lesson content with
          headings, lists, code blocks, and links.
        </p>
      </div>
      <AdminAcademyPanel />
    </div>
  );
}
