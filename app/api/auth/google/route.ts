import { NextResponse } from "next/server";
import { GOOGLE_OAUTH_CALLBACK_PATH } from "@/lib/auth/constants";
import {
  buildGoogleAuthorizeUrl,
  signGoogleOAuthState,
} from "@/lib/auth/google-oauth";
import { oauthPublicOrigin } from "@/lib/auth/oauth-public-origin";
import { safeInternalPath } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeInternalPath(
    url.searchParams.get("next") ?? undefined,
    "/app",
  );
  const fromRaw = url.searchParams.get("from");
  const from = fromRaw === "register" ? "register" : "login";

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.",
      },
      { status: 503 },
    );
  }

  if (!process.env.JWT_SECRET?.trim()) {
    return NextResponse.json(
      {
        error:
          "Server misconfiguration: JWT_SECRET is missing. Add it to your .env file.",
      },
      { status: 500 },
    );
  }

  let state: string;
  try {
    state = await signGoogleOAuthState({ next, from });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not start Google sign-in." },
      { status: 500 },
    );
  }

  const redirectUri = `${oauthPublicOrigin(request)}${GOOGLE_OAUTH_CALLBACK_PATH}`;
  const googleUrl = buildGoogleAuthorizeUrl({
    clientId,
    redirectUri,
    state,
  });

  return NextResponse.redirect(googleUrl);
}
