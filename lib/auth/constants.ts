/** HTTP-only cookie storing the JWT */
export const AUTH_COOKIE_NAME = "mr_session";

/** Internal request headers set by middleware after JWT verification (client values are stripped). */
export const HEADER_USER_ID = "x-mr-software-user-id";
export const HEADER_USER_ROLE = "x-mr-software-role";

export const AUTH_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/**
 * Google OAuth redirect path — full URI is `{AUTH_PUBLIC_ORIGIN or request origin}{this path}`.
 * Must match Google Cloud Console → Authorized redirect URIs
 * (see `lib/auth/oauth-public-origin.ts`).
 */
export const GOOGLE_OAUTH_CALLBACK_PATH = "/api/auth/callback/google";

/** GitHub OAuth for deploy — register in GitHub App → Authorization callback URL */
export const GITHUB_OAUTH_CALLBACK_PATH = "/api/github/callback";
