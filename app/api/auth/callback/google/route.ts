import { NextResponse } from "next/server";
import { Plan, Role, SubscriptionStatus } from "@prisma/client";
import { buildAuthCookie } from "@/lib/auth/cookie-options";
import { GOOGLE_OAUTH_CALLBACK_PATH } from "@/lib/auth/constants";
import {
  exchangeGoogleAuthCode,
  fetchGoogleUserInfo,
  verifyGoogleOAuthState,
} from "@/lib/auth/google-oauth";
import { signAuthToken } from "@/lib/auth/jwt";
import {
  canSignInWhileLocked,
  isAuthLocked,
} from "@/lib/auth/auth-lock";
import { userFacingDbError } from "@/lib/db-errors";
import { oauthPublicOrigin } from "@/lib/auth/oauth-public-origin";
import { prisma } from "@/lib/prisma";
import { safeInternalPath } from "@/lib/safe-redirect";
import { postLoginPath } from "@/lib/auth/post-login-redirect";

function redirectOAuthError(
  request: Request,
  from: "login" | "register",
  code: string,
  next: string,
) {
  const base = new URL(request.url).origin;
  const path = from === "register" ? "/auth/register" : "/auth/login";
  const u = new URL(path, base);
  u.searchParams.set("oauth_error", code);
  u.searchParams.set("next", safeInternalPath(next, "/app"));
  return NextResponse.redirect(u);
}

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oauthErr = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");

  let oauthPayload: { next: string; from: "login" | "register" } | null = null;
  if (stateParam) {
    try {
      oauthPayload = await verifyGoogleOAuthState(stateParam);
    } catch {
      oauthPayload = null;
    }
  }

  const fallbackNext = "/app";
  const from = oauthPayload?.from ?? "login";
  const next = oauthPayload?.next ?? fallbackNext;

  if (oauthErr) {
    if (oauthErr === "access_denied") {
      return redirectOAuthError(request, from, "denied", next);
    }
    console.error("Google OAuth callback ?error=", oauthErr);
    return redirectOAuthError(request, from, "google", next);
  }

  if (!code || !stateParam || !oauthPayload) {
    return redirectOAuthError(request, "login", "state", fallbackNext);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret || !process.env.JWT_SECRET?.trim()) {
    return redirectOAuthError(request, from, "config", next);
  }

  const redirectUri = `${oauthPublicOrigin(request)}${GOOGLE_OAUTH_CALLBACK_PATH}`;

  let accessToken: string;
  try {
    const tokens = await exchangeGoogleAuthCode({
      code,
      clientId,
      clientSecret,
      redirectUri,
    });
    accessToken = tokens.access_token;
  } catch {
    return redirectOAuthError(request, from, "token", next);
  }

  let profile;
  try {
    profile = await fetchGoogleUserInfo(accessToken);
  } catch {
    return redirectOAuthError(request, from, "token", next);
  }

  if (!profile.email_verified) {
    return redirectOAuthError(request, from, "email", next);
  }

  const displayName =
    profile.name.trim() || profile.email.split("@")[0] || "Google user";

  const authLocked = isAuthLocked();

  let user;
  try {
    const existingByGoogle = await prisma.user.findUnique({
      where: { googleId: profile.sub },
      select: userSelect,
    });

    if (existingByGoogle) {
      if (authLocked && !canSignInWhileLocked(existingByGoogle.role)) {
        return redirectOAuthError(request, from, "auth_lock", next);
      }
      user = await prisma.user.update({
        where: { id: existingByGoogle.id },
        data: { name: displayName },
        select: userSelect,
      });
    } else {
      const byEmail = await prisma.user.findUnique({
        where: { email: profile.email },
        select: { ...userSelect, googleId: true },
      });

      if (byEmail) {
        if (authLocked && !canSignInWhileLocked(byEmail.role)) {
          return redirectOAuthError(request, from, "auth_lock", next);
        }
        if (byEmail.googleId && byEmail.googleId !== profile.sub) {
          return redirectOAuthError(request, from, "link", next);
        }
        user = await prisma.user.update({
          where: { id: byEmail.id },
          data: { googleId: profile.sub, name: displayName },
          select: userSelect,
        });
      } else {
        if (authLocked) {
          return redirectOAuthError(request, from, "auth_lock", next);
        }
        user = await prisma.user.create({
          data: {
            name: displayName,
            email: profile.email,
            googleId: profile.sub,
            password: null,
            role: Role.USER,
            subscription: {
              create: {
                plan: Plan.FREE,
                status: SubscriptionStatus.ACTIVE,
              },
            },
          },
          select: userSelect,
        });
      }
    }
  } catch (e) {
    console.error("Google OAuth user create/update:", e);
    const prismaCode =
      e &&
      typeof e === "object" &&
      "code" in e &&
      typeof (e as { code: unknown }).code === "string"
        ? (e as { code: string }).code
        : "";

    if (prismaCode === "P2002") {
      return redirectOAuthError(request, from, "link", next);
    }

    const schemaCodes = new Set(["P2021", "P2022", "P2011"]);
    if (schemaCodes.has(prismaCode)) {
      return redirectOAuthError(request, from, "db_schema", next);
    }

    if (userFacingDbError(e)) {
      return redirectOAuthError(request, from, "db", next);
    }

    return redirectOAuthError(request, from, "unknown", next);
  }

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      plan: Plan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
    update: {},
  });

  if (user.status === "BANNED") {
    return redirectOAuthError(request, from, "banned", next);
  }

  if (user.status !== "ACTIVE") {
    return redirectOAuthError(request, from, "inactive", next);
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
    return redirectOAuthError(request, from, "unknown", next);
  }

  const dest = new URL(postLoginPath(user.role, next), url.origin);
  const res = NextResponse.redirect(dest);
  const cookie = buildAuthCookie(token);
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
