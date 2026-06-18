import { safeInternalPath } from "@/lib/safe-redirect";

/** Routes that belong to the developer/member workspace — not the admin console. */
export function isDeveloperWorkspacePath(pathname: string): boolean {
  if (pathname === "/app" || pathname.startsWith("/app/")) return true;

  const roots = ["/deploy", "/projects", "/settings", "/listings", "/earnings", "/payouts"] as const;
  return roots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

/** Where to send a user after sign-in based on role. */
export function postLoginPath(role: string, requested?: string): string {
  const fallback =
    role === "ADMIN" ? "/admin" : role === "USER" ? "/app/home" : "/app";
  const safe = safeInternalPath(requested, fallback);

  if (role === "ADMIN") {
    if (safe.startsWith("/admin")) return safe;
    return "/admin";
  }

  if (role === "USER" && (safe === "/app" || safe === "/app/")) {
    return "/app/home";
  }

  return safe;
}
