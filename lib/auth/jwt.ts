import jwt from "jsonwebtoken";
import type { Role, UserStatus } from "@prisma/client";
import { AUTH_COOKIE_MAX_AGE_SEC } from "./constants";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  canUpload: boolean;
  canPublish: boolean;
  canWithdraw: boolean;
  /** Must match User.sessionVersion */
  sessionVersion: number;
};

function requireSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

function isRole(value: unknown): value is Role {
  return value === "USER" || value === "DEVELOPER" || value === "ADMIN";
}

function isUserStatus(value: unknown): value is UserStatus {
  return (
    value === "ACTIVE" ||
    value === "RESTRICTED" ||
    value === "SUSPENDED" ||
    value === "BANNED"
  );
}

export function signAuthToken(input: {
  userId: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  canUpload: boolean;
  canPublish: boolean;
  canWithdraw: boolean;
  sessionVersion: number;
}): string {
  return jwt.sign(
    {
      email: input.email,
      name: input.name,
      role: input.role,
      status: input.status,
      canUpload: input.canUpload,
      canPublish: input.canPublish,
      canWithdraw: input.canWithdraw,
      sessionVersion: input.sessionVersion,
    },
    requireSecret(),
    {
      subject: input.userId,
      expiresIn: AUTH_COOKIE_MAX_AGE_SEC,
      algorithm: "HS256",
    },
  );
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, requireSecret(), {
    algorithms: ["HS256"],
  }) as jwt.JwtPayload & {
    email?: unknown;
    name?: unknown;
    role?: unknown;
    status?: unknown;
    canUpload?: unknown;
    canPublish?: unknown;
    canWithdraw?: unknown;
    sessionVersion?: unknown;
  };

  if (
    typeof decoded.sub !== "string" ||
    typeof decoded.email !== "string" ||
    typeof decoded.name !== "string" ||
    !isRole(decoded.role)
  ) {
    throw new Error("Invalid token payload");
  }

  const status: UserStatus = isUserStatus(decoded.status)
    ? decoded.status
    : "ACTIVE";
  const canUpload =
    typeof decoded.canUpload === "boolean" ? decoded.canUpload : true;
  const canPublish =
    typeof decoded.canPublish === "boolean" ? decoded.canPublish : true;
  const canWithdraw =
    typeof decoded.canWithdraw === "boolean" ? decoded.canWithdraw : true;
  const sessionVersion =
    typeof decoded.sessionVersion === "number" && Number.isFinite(decoded.sessionVersion)
      ? decoded.sessionVersion
      : 1;

  return {
    sub: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
    status,
    canUpload,
    canPublish,
    canWithdraw,
    sessionVersion,
  };
}
