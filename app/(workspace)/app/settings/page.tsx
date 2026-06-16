import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { prisma } from "@/lib/prisma";
import { PortalSettingsForm } from "@/components/app/portal-settings-form";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) notFound();

  if (userCanDeploy(session.role)) {
    redirect("/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { password: true, googleId: true },
  });
  const googleOnly = Boolean(user?.googleId && !user?.password);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Profile and account preferences.</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Profile</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-[var(--muted)]">Name</span>
            <br />
            <span className="font-medium text-[var(--foreground)]">{session.name}</span>
          </p>
          <p>
            <span className="text-[var(--muted)]">Email</span>
            <br />
            <span className="font-medium text-[var(--foreground)]">{session.email}</span>
          </p>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Password & sign-in</h2>
        <p className="text-sm text-[var(--muted)]">
          {googleOnly
            ? "This account uses Google sign-in. Add a password from the account security flow when that is available."
            : "Change your password on the sign-in page when a dedicated password reset flow is enabled."}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Session</h2>
        <p className="text-sm text-[var(--muted)]">Sign out on this device from the account menu, or use the button below.</p>
        <PortalSettingsForm />
      </section>

      <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Notifications</h2>
        <p className="text-sm text-[var(--muted)]">
          In-app and email notification preferences will live here. Nothing to configure yet.
        </p>
      </section>
    </div>
  );
}
