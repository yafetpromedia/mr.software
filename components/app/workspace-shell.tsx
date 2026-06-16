"use client";

import { usePathname } from "next/navigation";
import { shouldUseDeveloperShell } from "@/lib/auth/workspace-surface";
import { ConsumerWorkspaceShell } from "@/components/app/consumer-workspace-shell";
import { DeveloperWorkspaceShell } from "@/components/app/developer-workspace-shell";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  userName: string;
  userEmail: string;
  role: string;
};

/**
 * Picks consumer “library” chrome vs unified developer studio chrome by role.
 */
export function WorkspaceShell({ children, userName, userEmail, role }: Props) {
  const pathname = usePathname() ?? "/";
  if (shouldUseDeveloperShell(pathname, role)) {
    return (
      <DeveloperWorkspaceShell userName={userName} userEmail={userEmail} role={role}>
        {children}
      </DeveloperWorkspaceShell>
    );
  }
  return (
    <ConsumerWorkspaceShell userName={userName} userEmail={userEmail} role={role}>
      {children}
    </ConsumerWorkspaceShell>
  );
}
