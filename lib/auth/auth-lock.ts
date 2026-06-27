import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const AUTH_LOCK_MESSAGE =
  "Sign-in and registration are temporarily disabled while maintenance is in progress. Only administrators can sign in.";

export const AUTH_LOCK_REGISTER_MESSAGE =
  "Registration is temporarily disabled while maintenance is in progress. Please check back soon.";

export function isAuthLockEnvOverride(): boolean {
  return process.env.AUTH_LOCK === "true";
}

export async function getAuthLockFromDb(): Promise<boolean> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: { authLock: true },
    });
    return row?.authLock ?? false;
  } catch {
    return false;
  }
}

export async function isAuthLocked(): Promise<boolean> {
  if (isAuthLockEnvOverride()) return true;
  return getAuthLockFromDb();
}

export async function setAuthLockEnabled(enabled: boolean): Promise<boolean> {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, authLock: enabled },
    update: { authLock: enabled },
  });
  return enabled;
}

export async function getAuthLockState(): Promise<{
  enabled: boolean;
  envOverride: boolean;
  adminToggle: boolean;
}> {
  const envOverride = isAuthLockEnvOverride();
  const adminToggle = await getAuthLockFromDb();
  return {
    enabled: envOverride || adminToggle,
    envOverride,
    adminToggle,
  };
}

export function canSignInWhileLocked(role: Role): boolean {
  return role === "ADMIN";
}
