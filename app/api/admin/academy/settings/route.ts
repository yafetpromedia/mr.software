import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin/audit";
import { upsertAcademySectionSettings } from "@/lib/academy/academy";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { adminAcademySectionSettingsSchema } from "@/lib/validation/academy";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminAcademySectionSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const settings = await upsertAcademySectionSettings(parsed.data);
    await logAdminAction({
      adminId: session.id,
      action: "academy.settings.update",
      targetType: "academy_settings",
      targetId: "1",
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save academy settings" }, { status: 500 });
  }
}
