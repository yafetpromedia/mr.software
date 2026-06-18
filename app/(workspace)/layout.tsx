import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/app/workspace-shell";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Your library",
  description: "Your software library, marketplace, and access on Mr.Software",
};

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  if (!session) {
    const pathname = (await headers()).get("x-mr-pathname") ?? "/app";
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }

  return (
    <WorkspaceShell userName={session.name} userEmail={session.email} role={session.role}>
      {children}
    </WorkspaceShell>
  );
}
