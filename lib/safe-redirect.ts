/** Prevent open redirects: only allow same-origin relative paths. */
export function safeInternalPath(path: string | undefined, fallback: string): string {
  if (!path || typeof path !== "string") return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
