import { NextResponse } from "next/server";
import { GITHUB_OAUTH_CALLBACK_PATH } from "@/lib/auth/constants";
import { oauthPublicOrigin } from "@/lib/auth/oauth-public-origin";
import { getGithubCredentials } from "@/lib/github/config";
import { upsertGithubConnection } from "@/lib/github/connection";
import {
  exchangeGithubAuthCode,
  fetchGithubUser,
  verifyGithubOAuthState,
} from "@/lib/github/oauth";
import { notifyGithubConnected } from "@/lib/notifications/events";
import { safeInternalPath } from "@/lib/safe-redirect";

function redirectError(request: Request, code: string, next?: string) {
  const dest = safeInternalPath(next, "/deploy?source=github");
  const u = new URL(dest, oauthPublicOrigin(request));
  u.searchParams.set("github_error", code);
  return NextResponse.redirect(u);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const oauthErr = url.searchParams.get("error");

  let statePayload: { userId: string; next: string } | null = null;
  if (stateParam) {
    try {
      statePayload = await verifyGithubOAuthState(stateParam);
    } catch {
      statePayload = null;
    }
  }

  const next = statePayload?.next ?? "/deploy?source=github";

  if (oauthErr) {
    if (oauthErr === "access_denied") {
      return redirectError(request, "denied", next);
    }
    return redirectError(request, "github", next);
  }

  if (!code || !stateParam || !statePayload) {
    return redirectError(request, "state", next);
  }

  let clientId: string;
  let clientSecret: string;
  try {
    ({ clientId, clientSecret } = getGithubCredentials());
  } catch {
    return redirectError(request, "config", next);
  }

  const redirectUri = `${oauthPublicOrigin(request)}${GITHUB_OAUTH_CALLBACK_PATH}`;

  let accessToken: string;
  let scope: string | undefined;
  try {
    const token = await exchangeGithubAuthCode({
      code,
      clientId,
      clientSecret,
      redirectUri,
    });
    accessToken = token.access_token;
    scope = token.scope;
  } catch {
    return redirectError(request, "token", next);
  }

  let githubUser;
  try {
    githubUser = await fetchGithubUser(accessToken);
  } catch {
    return redirectError(request, "user", next);
  }

  try {
    await upsertGithubConnection({
      userId: statePayload.userId,
      githubId: githubUser.id,
      login: githubUser.login,
      accessToken,
      scope,
    });
    await notifyGithubConnected({
      userId: statePayload.userId,
      login: githubUser.login,
    }).catch((e) => console.error("github notification", e));
  } catch (e) {
    console.error("GitHub connection save failed", e);
    return redirectError(request, "db", next);
  }

  const success = new URL(next, oauthPublicOrigin(request));
  success.searchParams.set("github_connected", "1");
  return NextResponse.redirect(success);
}
