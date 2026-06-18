import { notFound } from "next/navigation";
import { SettingsDashboard } from "@/components/app/settings-dashboard";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";
import { prisma } from "@/lib/prisma";
import { getOwnStorefront } from "@/lib/storefront/storefront";

export const metadata = { title: "Settings" };

export default async function DeveloperSettingsPage() {
  const session = await getSession();
  if (!session) notFound();
  assertDeveloperPortalUser(session);

  const [user, storefront] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: {
        password: true,
        googleId: true,
        stripeCustomerId: true,
        createdAt: true,
      },
    }),
    getOwnStorefront(session.id),
  ]);

  if (!user) notFound();

  return (
    <SettingsDashboard
      settingsHref="/settings"
      storefrontHandle={storefront?.handle ?? null}
      profile={{
        name: session.name,
        email: session.email,
        role: session.role,
        hasPassword: Boolean(user.password),
        hasGoogle: Boolean(user.googleId),
        memberSince: user.createdAt.toISOString(),
        stripeLinked: Boolean(user.stripeCustomerId),
      }}
    />
  );
}
