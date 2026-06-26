import type { Role } from "@prisma/client";

export function isAuthLocked(): boolean {
  return process.env.AUTH_LOCK === "true";
}

export const AUTH_LOCK_MESSAGE =
  "Sign-in and registration are temporarily disabled while maintenance is in progress. Only administrators can sign in.";

export const AUTH_LOCK_REGISTER_MESSAGE =
  "Registration is temporarily disabled while maintenance is in progress. Please check back soon.";

export function canSignInWhileLocked(role: Role): boolean {
  return role === "ADMIN";
}
