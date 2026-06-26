import { NextResponse } from "next/server";
import { Plan, Role, SubscriptionStatus } from "@prisma/client";
import { buildAuthCookie } from "@/lib/auth/cookie-options";
import { userFacingDbError } from "@/lib/db-errors";
import { signAuthToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/log";
import {
  AUTH_LOCK_REGISTER_MESSAGE,
  isAuthLocked,
} from "@/lib/auth/auth-lock";
import { registerBodySchema } from "@/lib/validation/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (isAuthLocked()) {
    return NextResponse.json({ error: AUTH_LOCK_REGISTER_MESSAGE }, { status: 503 });
  }

  const ip = getClientIp(request);
  const rl = checkRateLimit(`register:${ip}`, 8, 3_600_000);
  if (!rl.ok) {
    logSecurityEvent("RATE_LIMITED", "register POST", { ip });
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
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

  const parsed = registerBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { name, email: emailRaw, password } = parsed.data;

  if (!process.env.JWT_SECRET?.trim()) {
    return NextResponse.json(
      {
        error:
          "Server misconfiguration: JWT_SECRET is missing. Add it to your .env file in the mr-software folder.",
      },
      { status: 500 },
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: emailRaw,
        password: passwordHash,
        role: Role.USER,
        subscription: {
          create: {
            plan: Plan.FREE,
            status: SubscriptionStatus.ACTIVE,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        canUpload: true,
        canPublish: true,
        canWithdraw: true,
        sessionVersion: true,
      },
    });

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
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const res = NextResponse.json({ user }, { status: 201 });
    const cookie = buildAuthCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    console.error(e);
    const hint = userFacingDbError(e);
    return NextResponse.json(
      { error: hint ?? "Failed to create account" },
      { status: hint ? 503 : 500 },
    );
  }
}
