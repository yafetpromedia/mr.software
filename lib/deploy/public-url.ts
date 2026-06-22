import type { Deployment } from "@prisma/client";
import { userShortId } from "./slug";

/**
 * Public URL for a deployment. Uses branded subdomain pattern when
 * `DEPLOYMENT_PUBLIC_HOST` is set; otherwise app-relative preview.
 */
export function buildDeploymentPublicUrl(
  deployment: Pick<Deployment, "id" | "slug" | "userId" | "runtime">,
  appBaseUrl: string,
): string {
  const base = appBaseUrl.replace(/\/$/, "");
  const host = process.env.DEPLOYMENT_PUBLIC_HOST?.trim();
  const useSubdomain = process.env.DEPLOYMENT_USE_SUBDOMAIN === "true";

  if (host && useSubdomain) {
    const sub = `${deployment.slug}-${userShortId(deployment.userId)}`;
    return `https://${sub}.${host}`;
  }

  if (deployment.runtime && deployment.runtime !== "STATIC") {
    return `${base}/api/deploy-runtime/${deployment.id}/`;
  }

  return `${base}/api/deploy-preview/${deployment.id}/`;
}

export function appBaseUrlFromRequest(request: Request): string {
  const env =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_PUBLIC_ORIGIN?.trim();
  if (env) {
    return env.replace(/\/$/, "");
  }
  return new URL(request.url).origin;
}
