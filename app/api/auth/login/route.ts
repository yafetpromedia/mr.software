import { NextResponse } from "next/server";
import { buildAuthCookie } from "@/lib/auth/cookie-options";
import { userFacingDbError } from "@/lib/db-errors";
import { signAuthToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { getClientIp } from "@/lib/security/client-ip";
import { logSecurityEvent } from "@/lib/security/log";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  AUTH_LOCK_MESSAGE,
  canSignInWhileLocked,
  isAuthLocked,
} from "@/lib/auth/auth-lock";
import { loginBodySchema } from "@/lib/validation/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`login:${ip}`, 5, 60_000);
  if (!rl.ok) {
    logSecurityEvent("RATE_LIMITED", "login POST", { ip });
    return NextResponse.json(
      { error: "Too many sign-in attempts. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    logSecurityEvent("VALIDATION_ERROR", msg, { ip });
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { email, password } = parsed.data;

  if (!process.env.JWT_SECRET?.trim()) {
    return NextResponse.json(
      {
        error:
          "Server misconfiguration: JWT_SECRET is missing. Add it to your .env.production file.",
      },
      { status: 500 },
    );
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        status: true,
        canUpload: true,
        canPublish: true,
        canWithdraw: true,
        sessionVersion: true,
      },
    });
  } catch (e) {
    console.error(e);
    const hint = userFacingDbError(e);
    return NextResponse.json(
      { error: hint ?? "Sign-in failed" },
      { status: hint ? 503 : 500 },
    );
  }

  if (!user) {
    logSecurityEvent("FAILED_LOGIN", "no user for email", { ip });
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  if (!user.password) {
    return NextResponse.json(
      {
        error:
          "This account uses Google sign-in. Use “Continue with Google” below.",
      },
      { status: 401 },
    );
  }

  if (!(await verifyPassword(password, user.password))) {
    logSecurityEvent("FAILED_LOGIN", "bad password", { ip, email: user.email });
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  if (user.status === "BANNED") {
    return NextResponse.json(
      { error: "This account has been banned" },
      { status: 403 },
    );
  }

  if (user.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Account is not active. Contact support." },
      { status: 403 },
    );
  }

  if (await isAuthLocked() && !canSignInWhileLocked(user.role)) {
    return NextResponse.json({ error: AUTH_LOCK_MESSAGE }, { status: 503 });
  }

  let token: string;
  try {
    token = signAuthToken({
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
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error:
          "Could not create session. Check JWT_SECRET in your project .env file.",
      },
      { status: 500 },
    );
  }

  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      canUpload: user.canUpload,
      canPublish: user.canPublish,
      canWithdraw: user.canWithdraw,
    },
  });
  const cookie = buildAuthCookie(token, request);
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
