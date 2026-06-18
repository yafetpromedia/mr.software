import { notFound, redirect } from "next/navigation";
import { SettingsDashboard } from "@/components/app/settings-dashboard";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Settings" };

export default async function MemberSettingsPage() {
  const session = await getSession();
  if (!session) notFound();

  if (userCanDeploy(session.role)) {
    redirect("/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      password: true,
      googleId: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  return (
    <SettingsDashboard
      settingsHref="/app/settings"
      profile={{
        name: session.name,
        email: session.email,
        role: session.role,
        hasPassword: Boolean(user.password),
        hasGoogle: Boolean(user.googleId),
        memberSince: user.createdAt.toISOString(),
      }}
    />
  );
}
