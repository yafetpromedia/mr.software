import { AUTH_COOKIE_MAX_AGE_SEC, AUTH_COOKIE_NAME } from "./constants";

export function buildAuthCookie(value: string) {
  return {
    name: AUTH_COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE_SEC,
    },
  };
}

export function clearAuthCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}
