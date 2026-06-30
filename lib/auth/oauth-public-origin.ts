/**
 * Public site origin for OAuth redirects and absolute links behind reverse proxies.
 *
 * Prefer `NEXT_PUBLIC_APP_URL` / `AUTH_PUBLIC_ORIGIN` in production (Docker + Caddy).
 * Without them, Node sees `http://localhost:3000` and post-login redirects break.
 */
export function appPublicOrigin(request: Request): string {
  const env =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_PUBLIC_ORIGIN?.trim();
  if (env) {
    return env.replace(/\/$/, "");
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (forwardedHost) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    return `${proto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

/** @deprecated alias — use {@link appPublicOrigin} */
export function oauthPublicOrigin(request: Request): string {
  return appPublicOrigin(request);
}
