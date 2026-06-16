import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin/audit";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { updateStorefrontAdminFlags } from "@/lib/storefront/admin";
import { adminStorefrontPatchSchema } from "@/lib/validation/storefront";

type RouteContext = { params: Promise<{ handle: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { handle } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminStorefrontPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  if (parsed.data.verified === undefined && parsed.data.featured === undefined) {
    return NextResponse.json({ error: "No changes requested" }, { status: 400 });
  }

  try {
    const updated = await updateStorefrontAdminFlags(handle, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
    }

    await logAdminAction({
      adminId: session.id,
      action: "storefront.update",
      targetType: "storefront",
      targetId: handle,
      detail: parsed.data,
    });

    return NextResponse.json({ storefront: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update storefront" }, { status: 500 });
  }
}
