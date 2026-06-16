import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin",
  description: "Mr.Software administration",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  if (!session || !isActiveAdmin(session)) {
    redirect("/app");
  }

  return (
    <AdminShell userName={session.name} userEmail={session.email}>
      {children}
    </AdminShell>
  );
}
