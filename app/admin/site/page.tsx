import { AdminSiteSettingsForm } from "@/components/admin/admin-site-settings-form";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: "Site settings",
};

export default async function AdminSiteSettingsPage() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Site settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Manage brand logo and partnerships shown on the landing page.
        </p>
      </div>
      <AdminSiteSettingsForm initialSettings={settings} />
    </div>
  );
}
