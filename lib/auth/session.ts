import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";
import { verifyAuthToken } from "./jwt";
import { prisma } from "@/lib/prisma";
import type { Role, UserStatus } from "@prisma/client";

export type AuthSession = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  canUpload: boolean;
  canPublish: boolean;
  canWithdraw: boolean;
  sessionVersion: number;
};

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  canUpload: true,
  canPublish: true,
  canWithdraw: true,
  sessionVersion: true,
} as const;

/**
 * Authoritative session from DB (JWT used only to identify the user).
 * - Banned accounts: logged out.
 * - Only ACTIVE users may use the product (strict).
 * - sessionVersion mismatch: treated as logged out (forced re-auth).
 */
export async function getSession(): Promise<AuthSession | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  let payload: ReturnType<typeof verifyAuthToken>;
  try {
    payload = verifyAuthToken(token);
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: userSelect,
  });

  if (!user) return null;
  if (user.status === "BANNED") return null;
  if (user.status !== "ACTIVE") return null;
  if (user.sessionVersion !== payload.sessionVersion) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    canUpload: user.canUpload,
    canPublish: user.canPublish,
    canWithdraw: user.canWithdraw,
    sessionVersion: user.sessionVersion,
  };
}
