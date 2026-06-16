import type { NextResponse } from "next/server";
import type { Role, UserStatus } from "@prisma/client";
import { buildAuthCookie } from "@/lib/auth/cookie-options";
import { signAuthToken } from "@/lib/auth/jwt";

type SessionUser = {
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

export function withRefreshedSessionCookie<T>(
  res: NextResponse<T>,
  user: SessionUser,
): NextResponse<T> {
  const token = signAuthToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    canUpload: user.canUpload,
    canPublish: user.canPublish,
    canWithdraw: user.canWithdraw,
    sessionVersion: user.sessionVersion,
  });
  const cookie = buildAuthCookie(token);
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
