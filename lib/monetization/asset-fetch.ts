/**
 * Basic SSRF guard for fetching remote assets (download proxy).
 * In production, only https is allowed; localhost / private ranges are blocked.
 * Optional `ALLOWED_ASSET_FETCH_HOSTS` (comma-separated) restricts to a fixed
 * allowlist (e.g. `cdn.mystore.com,storage.example.com`) — best for production.
 */
export function assertFetchableAssetUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid asset URL");
  }

  const isProd = process.env.NODE_ENV === "production";
  const protocol = url.protocol.toLowerCase();

  if (isProd && protocol !== "https:") {
    throw new Error("Asset URL must use HTTPS in production");
  }
  if (!isProd && protocol !== "http:" && protocol !== "https:") {
    throw new Error("Unsupported URL scheme");
  }

  const host = url.hostname.toLowerCase();
  const allowlist =
    process.env.ALLOWED_ASSET_FETCH_HOSTS?.split(/[\s,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? [];
  if (allowlist.length > 0 && !allowlist.includes(host)) {
    throw Object.assign(
      new Error("Asset host is not on ALLOWED_ASSET_FETCH_HOSTS allowlist"),
      { code: "SSRF_HOST_BLOCKED" as const },
    );
  }

  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".localhost")
  ) {
    if (isProd) {
      throw new Error("Local asset URLs are not allowed in production");
    }
  }

  const privateLike =
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host) ||
    /^169\.254\./.test(host);

  if (privateLike && isProd) {
    throw new Error("Private network asset URLs are not allowed");
  }

  return url;
}
