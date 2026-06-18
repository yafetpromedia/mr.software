import { SignJWT, jwtVerify } from "jose";
import { safeInternalPath } from "@/lib/safe-redirect";

const GITHUB_AUTH = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";
const GITHUB_USER = "https://api.github.com/user";

export type GithubOAuthState = {
  userId: string;
  next: string;
};

function jwtSecretKey() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function signGithubOAuthState(payload: GithubOAuthState): Promise<string> {
  const key = jwtSecretKey();
  return new SignJWT({ userId: payload.userId, next: payload.next })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(key);
}

export async function verifyGithubOAuthState(state: string): Promise<GithubOAuthState> {
  const key = jwtSecretKey();
  const { payload } = await jwtVerify(state, key, { algorithms: ["HS256"] });
  const userId = typeof payload.userId === "string" ? payload.userId : "";
  if (!userId) throw new Error("invalid_state");
  const next = safeInternalPath(
    typeof payload.next === "string" ? payload.next : undefined,
    "/deploy?source=github",
  );
  return { userId, next };
}

export function buildGithubAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const u = new URL(GITHUB_AUTH);
  u.searchParams.set("client_id", params.clientId);
  u.searchParams.set("redirect_uri", params.redirectUri);
  u.searchParams.set("scope", "read:user repo");
  u.searchParams.set("state", params.state);
  return u.toString();
}

export async function exchangeGithubAuthCode(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{ access_token: string; scope?: string }> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    code: params.code,
    redirect_uri: params.redirectUri,
  });
  const res = await fetch(GITHUB_TOKEN, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("GitHub token exchange failed", res.status, data);
    throw new Error("token_exchange_failed");
  }
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as { access_token?: unknown }).access_token !== "string"
  ) {
    throw new Error("token_exchange_failed");
  }
  const scope =
    typeof (data as { scope?: unknown }).scope === "string"
      ? (data as { scope: string }).scope
      : undefined;
  return { access_token: (data as { access_token: string }).access_token, scope };
}

export type GithubUser = {
  id: number;
  login: string;
  name: string | null;
};

export async function fetchGithubUser(accessToken: string): Promise<GithubUser> {
  const res = await fetch(GITHUB_USER, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("GitHub user fetch failed", res.status, data);
    throw new Error("user_fetch_failed");
  }
  if (!data || typeof data !== "object") throw new Error("user_fetch_failed");
  const o = data as Record<string, unknown>;
  if (typeof o.id !== "number" || typeof o.login !== "string") {
    throw new Error("user_fetch_failed");
  }
  return {
    id: o.id,
    login: o.login,
    name: typeof o.name === "string" ? o.name : null,
  };
}
