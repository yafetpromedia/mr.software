import { NextResponse } from "next/server";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { listStorefrontsForAdmin } from "@/lib/storefront/admin";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const storefronts = await listStorefrontsForAdmin();
  return NextResponse.json({ storefronts });
}
