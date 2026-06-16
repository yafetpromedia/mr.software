import { SignJWT, jwtVerify } from "jose";
import { safeInternalPath } from "@/lib/safe-redirect";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";

export type OAuthStatePayload = {
  next: string;
  from: "login" | "register";
};

function jwtSecretKey() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function signGoogleOAuthState(
  payload: OAuthStatePayload,
): Promise<string> {
  const key = jwtSecretKey();
  return new SignJWT({
    next: payload.next,
    from: payload.from,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(key);
}

export async function verifyGoogleOAuthState(
  state: string,
): Promise<OAuthStatePayload> {
  const key = jwtSecretKey();
  const { payload } = await jwtVerify(state, key, { algorithms: ["HS256"] });
  const next = safeInternalPath(
    typeof payload.next === "string" ? payload.next : undefined,
    "/app",
  );
  const fromRaw = payload.from;
  const from =
    fromRaw === "register" || fromRaw === "login" ? fromRaw : "login";
  return { next, from };
}

export function buildGoogleAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const u = new URL(GOOGLE_AUTH);
  u.searchParams.set("client_id", params.clientId);
  u.searchParams.set("redirect_uri", params.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "openid email profile");
  u.searchParams.set("state", params.state);
  u.searchParams.set("prompt", "select_account");
  return u.toString();
}

export async function exchangeGoogleAuthCode(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{ access_token: string }> {
  const body = new URLSearchParams({
    code: params.code,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Google token exchange failed", res.status, data);
    throw new Error("token_exchange_failed");
  }
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as { access_token?: unknown }).access_token !== "string"
  ) {
    throw new Error("token_exchange_failed");
  }
  return { access_token: (data as { access_token: string }).access_token };
}

export type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
};

export async function fetchGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Google userinfo failed", res.status, data);
    throw new Error("userinfo_failed");
  }
  if (!data || typeof data !== "object") {
    throw new Error("userinfo_failed");
  }
  const o = data as Record<string, unknown>;
  if (
    typeof o.sub !== "string" ||
    typeof o.email !== "string" ||
    typeof o.name !== "string"
  ) {
    throw new Error("userinfo_failed");
  }
  const email_verified = o.email_verified === true;
  return { sub: o.sub, email: o.email.trim().toLowerCase(), email_verified, name: o.name };
}
