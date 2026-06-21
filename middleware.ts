import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  HEADER_USER_ID,
  HEADER_USER_ROLE,
} from "@/lib/auth/constants";
import { isDeveloperWorkspacePath } from "@/lib/auth/post-login-redirect";

const INTERNAL_HEADER_PREFIX = "x-mr-software-";

function stripInternalHeaders(headers: Headers): Headers {
  const next = new Headers(headers);
  for (const key of next.keys()) {
    if (key.toLowerCase().startsWith(INTERNAL_HEADER_PREFIX)) {
      next.delete(key);
    }
  }
  return next;
}

function isRole(value: unknown): value is "USER" | "DEVELOPER" | "ADMIN" {
  return value === "USER" || value === "DEVELOPER" || value === "ADMIN";
}

function isUserStatus(
  value: unknown,
): value is "ACTIVE" | "RESTRICTED" | "SUSPENDED" | "BANNED" {
  return (
    value === "ACTIVE" ||
    value === "RESTRICTED" ||
    value === "SUSPENDED" ||
    value === "BANNED"
  );
}

function jsonMessage(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function withPathname(headers: Headers, pathname: string): Headers {
  const next = new Headers(headers);
  next.set("x-mr-pathname", pathname);
  return next;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const headers = stripInternalHeaders(request.headers);
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  const publicStorefrontHandle =
    pathname.match(/^\/store\/([^/]+)\/?$/)?.[1] ??
    pathname.match(/^\/@([^/]+)\/?$/)?.[1];

  if (publicStorefrontHandle && token && secret) {
    try {
      const key = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
      const role = payload.role;
      const handle = decodeURIComponent(publicStorefrontHandle);
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL(`/store/${handle}`, request.url));
      }
      return NextResponse.redirect(new URL(`/app/store/${handle}`, request.url));
    } catch {
      // Invalid token — show public storefront
    }
  }

  const softwareId = pathname.match(/^\/software\/([^/]+)\/?$/)?.[1];
  const catalogPortalPath =
    pathname === "/marketplace" || pathname === "/marketplace/"
      ? "/app/marketplace"
      : softwareId
        ? `/app/software/${softwareId}`
        : null;

  if (catalogPortalPath && token && secret) {
    try {
      const key = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
      const role = payload.role;
      if (role === "USER" || role === "DEVELOPER") {
        const dest = new URL(catalogPortalPath, request.url);
        dest.search = request.nextUrl.search;
        return NextResponse.redirect(dest);
      }
    } catch {
      // Invalid token — show public catalog
    }
  }

  const isAdminPath = pathname.startsWith("/api/admin");
  const isAdminUi = pathname.startsWith("/admin");
  const isSoftwareApi = pathname.startsWith("/api/software");

  if (isAdminUi && (!token || !secret)) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (isAdminPath && (!token || !secret)) {
    return jsonMessage("Unauthorized", 401);
  }

  if (!token || !secret) {
    return NextResponse.next({
      request: { headers: withPathname(headers, pathname) },
    });
  }

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const sub = typeof payload.sub === "string" ? payload.sub : undefined;
    const role = payload.role;
    const status = isUserStatus(payload.status) ? payload.status : "ACTIVE";
    const canUpload =
      typeof payload.canUpload === "boolean" ? payload.canUpload : true;

    if (sub && isRole(role)) {
      headers.set(HEADER_USER_ID, sub);
      headers.set(HEADER_USER_ROLE, role);
      if ((pathname === "/app" || pathname === "/app/") && role === "USER") {
        return NextResponse.redirect(new URL("/app/home", request.url));
      }
      if (role === "ADMIN" && status === "ACTIVE" && isDeveloperWorkspacePath(pathname)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    if (isAdminPath) {
      if (!isRole(role) || role !== "ADMIN") {
        return jsonMessage("Forbidden", 403);
      }
      if (status === "BANNED") {
        return jsonMessage("Account banned", 403);
      }
      if (status !== "ACTIVE") {
        return jsonMessage("Admin actions require an active account", 403);
      }
    }

    if (isAdminUi) {
      if (!isRole(role) || role !== "ADMIN" || status !== "ACTIVE") {
        return NextResponse.redirect(new URL("/app", request.url));
      }
    }

    if (isSoftwareApi) {
      if (status === "BANNED") {
        return jsonMessage("Account banned", 403);
      }
      if (method === "POST") {
        if (status !== "ACTIVE") {
          return jsonMessage(
            "Only active accounts can upload software",
            403,
          );
        }
        if (!canUpload) {
          return jsonMessage("Upload is disabled for this account", 403);
        }
      }
    }

    return NextResponse.next({
      request: { headers: withPathname(headers, pathname) },
    });
  } catch {
    if (isAdminPath) {
      return jsonMessage("Unauthorized", 401);
    }
    if (isAdminUi) {
      const login = new URL("/auth/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next({
      request: { headers: withPathname(headers, pathname) },
    });
  }
}

export const config = {
  matcher: [
    "/marketplace",
    "/software/:path*",
    "/store/:path*",
    "/app",
    "/app/:path*",
    "/deploy",
    "/deploy/:path*",
    "/projects",
    "/projects/:path*",
    "/settings",
    "/settings/:path*",
    "/listings",
    "/listings/:path*",
    "/earnings",
    "/earnings/:path*",
    "/payouts",
    "/payouts/:path*",
    "/api/software/:path*",
    "/api/admin/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
