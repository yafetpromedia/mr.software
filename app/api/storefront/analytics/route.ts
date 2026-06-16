import { NextResponse } from "next/server";
import { userCanDeploy } from "@/lib/auth/user-can-deploy";
import { getSession } from "@/lib/auth/session";
import { getStorefrontAnalytics } from "@/lib/storefront/storefront";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!userCanDeploy(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const analytics = await getStorefrontAnalytics(session.id);
  if (!analytics) {
    return NextResponse.json({ analytics: null });
  }
  return NextResponse.json({ analytics });
}
