/**
 * Origin used for Google OAuth `redirect_uri` (authorize + token exchange).
 *
 * Set `AUTH_PUBLIC_ORIGIN` in `.env` to match **exactly** one of your
 * Google Cloud Console → OAuth client → Authorized redirect URIs
 * (e.g. `http://localhost:3000` — no trailing slash).
 *
 * If unset, the incoming request’s `Origin` / URL origin is used, so using
 * `http://127.0.0.1:3000` vs `http://localhost:3000` must both be registered
 * in Google if you switch between them.
 */
export function oauthPublicOrigin(request: Request): string {
  const raw = process.env.AUTH_PUBLIC_ORIGIN?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return new URL(request.url).origin;
}
