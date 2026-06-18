/**
 * Client-safe: do not import Prisma here.
 *
 * Developers get one unified studio shell (build + library).
 * Members (USER role) keep the consumer library shell.
 */
export function shouldUseDeveloperShell(_pathname: string, role: string): boolean {
  return role === "DEVELOPER";
}

/** Routes where the top bar should search purchased/catalog software, not deploy projects. */
export function isLibrarySurface(pathname: string): boolean {
  if (pathname === "/app/home" || pathname.startsWith("/app/home/")) return true;
  if (pathname === "/app/marketplace" || pathname.startsWith("/app/marketplace/")) return true;
  if (pathname === "/app/my-software" || pathname.startsWith("/app/my-software/")) return true;
  if (pathname === "/app/billing" || pathname.startsWith("/app/billing/")) return true;
  if (pathname.startsWith("/app/store/")) return true;
  return false;
}
