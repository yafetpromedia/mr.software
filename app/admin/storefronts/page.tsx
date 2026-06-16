import { AdminStorefrontsPanel } from "@/components/admin/admin-storefronts-panel";

export const metadata = {
  title: "Storefronts",
};

export default function AdminStorefrontsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Storefronts
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Verify creators and feature storefronts on the marketplace and landing page.
        </p>
      </div>
      <AdminStorefrontsPanel />
    </div>
  );
}
