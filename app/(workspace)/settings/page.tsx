import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { getOwnStorefront } from "@/lib/storefront/storefront";
import { PortalSettingsForm } from "@/components/app/portal-settings-form";
import { StorefrontSettingsForm } from "@/components/app/storefront-settings-form";
import { StorefrontAnalyticsPanel } from "@/components/storefront/storefront-client";

export const metadata = { title: "Developer settings" };

export default async function DeveloperSettingsPage() {
  const session = await getSession();
  if (!session) notFound();
  assertDeveloperPortalUser(session);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { password: true, googleId: true, stripeCustomerId: true },
  });
  const storefront = await getOwnStorefront(session.id);
  const googleOnly = Boolean(user?.googleId && !user?.password);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Account, payouts, storefront, and security — one workspace.</p>
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

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Developer storefront</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Your public store at <code className="text-xs">mr.software/@handle</code> — products,
            brand, and future customer tools.
          </p>
        </div>
        <StorefrontSettingsForm initial={storefront} />
        <div className="mt-6 border-t border-[var(--border)] pt-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Store analytics</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Views, followers, and recent activity.</p>
          <div className="mt-4">
            <StorefrontAnalyticsPanel />
          </div>
        </div>
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

      <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Session</h2>
        <PortalSettingsForm />
      </section>
    </div>
  );
}
