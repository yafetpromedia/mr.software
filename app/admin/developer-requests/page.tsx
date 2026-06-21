import type { Metadata } from "next";
import { AdminDeveloperRequestsPanel } from "@/components/admin/admin-developer-requests-panel";

export const metadata: Metadata = {
  title: "Developer requests",
  description: "Review member requests for developer access",
};

export default function AdminDeveloperRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Developer access requests
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Members request promotion from Settings → Developer access. Approve to set their role to{" "}
          <strong className="font-medium text-[var(--foreground)]">DEVELOPER</strong> and unlock deploy,
          storefront, and listings. You can also promote manually from{" "}
          <a href="/admin/users" className="text-[var(--accent)] hover:underline">
            Users
          </a>
          .
        </p>
      </div>
      <AdminDeveloperRequestsPanel />
    </div>
  );
}
