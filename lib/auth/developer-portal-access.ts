import { redirect } from "next/navigation";
import type { AuthSession } from "./session";
import { userCanDeploy } from "./user-can-deploy";

/** Redirects members away from build/monetize surfaces. */
export function assertDeveloperPortalUser(session: AuthSession | null): void {
  if (!session) {
    redirect("/auth/login?next=/app");
  }
  if (!userCanDeploy(session.role)) {
    redirect("/app/home");
  }
}
