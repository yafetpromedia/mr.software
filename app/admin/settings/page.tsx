import { AdminAccountSettings } from "@/components/admin/admin-account-settings";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile settings",
};

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login?next=/admin/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      role: true,
      password: true,
      googleId: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/auth/login?next=/admin/settings");

  return (
    <AdminAccountSettings
      initial={{
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: Boolean(user.password),
        hasGoogle: Boolean(user.googleId),
        memberSince: user.createdAt.toISOString(),
      }}
    />
  );
}
