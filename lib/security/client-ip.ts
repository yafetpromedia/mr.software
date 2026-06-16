/**
 * Best-effort client IP for rate limiting. Prefer the first
 * `x-forwarded-for` hop when the app is behind a trusted proxy; otherwise
 * falls back. Not cryptographically strong — pair with WAF/edge where needed.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}
