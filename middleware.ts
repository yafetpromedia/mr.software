import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  HEADER_USER_ID,
  HEADER_USER_ROLE,
} from "@/lib/auth/constants";
import { appPublicOrigin } from "@/lib/auth/oauth-public-origin";
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

function publicRedirect(
  request: NextRequest,
  pathname: string,
  opts?: { search?: string; searchParams?: Record<string, string> },
) {
  const url = new URL(pathname, appPublicOrigin(request));
  if (opts?.search !== undefined) url.search = opts.search;
  if (opts?.searchParams) {
    for (const [key, value] of Object.entries(opts.searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return NextResponse.redirect(url);
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
        return publicRedirect(request, `/store/${handle}`);
      }
      return publicRedirect(request, `/app/store/${handle}`);
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
        return publicRedirect(request, catalogPortalPath, {
          search: request.nextUrl.search,
        });
      }
    } catch {
      // Invalid token — show public catalog
    }
  }

  const isAdminPath = pathname.startsWith("/api/admin");
  const isAdminUi = pathname.startsWith("/admin");
  const isSoftwareApi = pathname.startsWith("/api/software");

  if (isAdminUi && (!token || !secret)) {
    return publicRedirect(request, "/auth/login", {
      searchParams: { next: pathname },
    });
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
        return publicRedirect(request, "/app/home");
      }
      if (role === "ADMIN" && status === "ACTIVE" && isDeveloperWorkspacePath(pathname)) {
        return publicRedirect(request, "/admin");
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
        return publicRedirect(request, "/app");
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
      return publicRedirect(request, "/auth/login", {
        searchParams: { next: pathname },
      });
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
    "/api/software",
    "/api/software/:path*",
    "/api/admin/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
