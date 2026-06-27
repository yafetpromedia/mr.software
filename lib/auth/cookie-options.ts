import { AUTH_COOKIE_MAX_AGE_SEC, AUTH_COOKIE_NAME } from "./constants";

/** Whether auth cookies should use the Secure flag (HTTPS only). */
export function isSecureAuthContext(request?: Request): boolean {
  if (process.env.AUTH_COOKIE_SECURE === "true") return true;
  if (process.env.AUTH_COOKIE_SECURE === "false") return false;

  if (request) {
    const forwarded = request.headers.get("x-forwarded-proto");
    if (forwarded) {
      return forwarded.split(",")[0]?.trim().toLowerCase() === "https";
    }
    try {
      return new URL(request.url).protocol === "https:";
    } catch {
      // fall through
    }
  }

  const origin =
    process.env.AUTH_PUBLIC_ORIGIN?.trim() ??
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (origin) return origin.startsWith("https://");

  return process.env.NODE_ENV === "production";
}

export function buildAuthCookie(value: string, request?: Request) {
  return {
    name: AUTH_COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      secure: isSecureAuthContext(request),
      sameSite: "lax" as const,
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE_SEC,
    },
  };
}

export function clearAuthCookie(request?: Request) {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: isSecureAuthContext(request),
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}
