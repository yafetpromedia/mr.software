import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { PortalSettingsForm } from "@/components/app/portal-settings-form";
import { NotificationSettingsForm } from "@/components/notifications/notification-settings-form";

export const metadata = { title: "Developer settings" };

export default async function DeveloperSettingsPage() {
  const session = await getSession();
  if (!session) notFound();
  assertDeveloperPortalUser(session);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { password: true, googleId: true, stripeCustomerId: true },
  });
  const googleOnly = Boolean(user?.googleId && !user?.password);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Account, security, and workspace preferences.</p>
      </div>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Profile</h2>
        <p className="text-sm">
          <span className="text-[var(--muted)]">Name</span>
          <br />
          <span className="font-medium text-[var(--foreground)]">{session.name}</span>
        </p>
        <p className="text-sm">
          <span className="text-[var(--muted)]">Email</span>
          <br />
          <span className="font-medium text-[var(--foreground)]">{session.email}</span>
        </p>
        {user?.stripeCustomerId ? (
          <p className="text-xs text-[var(--muted)]">Billing customer id is linked for Stripe.</p>
        ) : null}
      </section>

      <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Creator storefront</h2>
        <p className="text-sm text-[var(--muted)]">
          Brand, handle, theme, and store analytics are managed on the dedicated storefront page.
        </p>
        <Link href="/app/storefront" className="inline-flex text-sm font-medium text-[var(--accent)] hover:underline">
          Open storefront →
        </Link>
      </section>

      <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Payouts &amp; KYC</h2>
        <p className="text-sm text-[var(--muted)]">
          Chapa and bank details for receiving ETB will be configured here. Not connected yet.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Password &amp; sign-in</h2>
        <p className="text-sm text-[var(--muted)]">
          {googleOnly
            ? "This account uses Google sign-in for login."
            : "Use the login flow to change password when a reset is enabled."}
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Your library</h2>
        <p className="text-sm text-[var(--muted)]">
          Same account — software you buy lives in your library alongside what you build and sell.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/app/home" className="text-sm font-medium text-[var(--accent)] hover:underline">
            My library
          </Link>
          <Link href="/app/my-software" className="text-sm font-medium text-[var(--accent)] hover:underline">
            My software
          </Link>
          <Link href="/app/billing" className="text-sm font-medium text-[var(--accent)] hover:underline">
            Purchases &amp; billing
          </Link>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Notifications</h2>
        <NotificationSettingsForm settingsHref="/settings" />
      </section>

      <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Session</h2>
        <PortalSettingsForm />
      </section>
    </div>
  );
}
