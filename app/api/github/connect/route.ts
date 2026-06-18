import { NextResponse } from "next/server";
import { GITHUB_OAUTH_CALLBACK_PATH } from "@/lib/auth/constants";
import { oauthPublicOrigin } from "@/lib/auth/oauth-public-origin";
import { getSession } from "@/lib/auth/session";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { isGithubConfigured, getGithubCredentials } from "@/lib/github/config";
import { buildGithubAuthorizeUrl, signGithubOAuthState } from "@/lib/github/oauth";
import { safeInternalPath } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to connect GitHub" }, { status: 401 });
  }

  if (!userCanDeploy(session.role)) {
    return NextResponse.json({ error: "Developer role required" }, { status: 403 });
  }

  if (!isGithubConfigured()) {
    return NextResponse.json(
      {
        error:
          "GitHub is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your .env file.",
      },
      { status: 503 },
    );
  }

  if (!process.env.JWT_SECRET?.trim()) {
    return NextResponse.json({ error: "JWT_SECRET is not configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  const next = safeInternalPath(
    url.searchParams.get("next") ?? undefined,
    "/deploy?source=github",
  );

  let state: string;
  try {
    state = await signGithubOAuthState({ userId: session.id, next });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not start GitHub authorization" }, { status: 500 });
  }

  const { clientId } = getGithubCredentials();
  const redirectUri = `${oauthPublicOrigin(request)}${GITHUB_OAUTH_CALLBACK_PATH}`;
  const githubUrl = buildGithubAuthorizeUrl({ clientId, redirectUri, state });

  return NextResponse.redirect(githubUrl);
}
