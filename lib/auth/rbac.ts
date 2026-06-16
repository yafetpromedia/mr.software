import type { Role } from "@prisma/client";
import type { AuthSession } from "@/lib/auth/session";

export function canPublishSoftware(role: Role): boolean {
  return role === "DEVELOPER" || role === "ADMIN";
}

export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

/** Admin API routes: role plus active account (DB-authoritative). */
export function isActiveAdmin(session: AuthSession): boolean {
  return session.role === "ADMIN" && session.status === "ACTIVE";
}
