import { AdminSiteSettingsForm } from "@/components/admin/admin-site-settings-form";
import { getAuthLockState } from "@/lib/auth/auth-lock";
import { getLaunchMapMode } from "@/lib/launch-map/launch-map";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: "Site settings",
};

export default async function AdminSiteSettingsPage() {
  const [settings, launchMapMode, authLock] = await Promise.all([
    getPublicSiteSettings(),
    getLaunchMapMode(),
    getAuthLockState(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Site settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Manage maintenance mode, brand logo, global launch map, and partnerships on the landing page.
        </p>
      </div>
      <AdminSiteSettingsForm
        initialSettings={{ ...settings, launchMapMode, authLock: authLock.adminToggle }}
        authLockEnvOverride={authLock.envOverride}
      />
    </div>
  );
}
