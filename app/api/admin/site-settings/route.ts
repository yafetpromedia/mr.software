import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin/audit";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { getPublicSiteSettings, upsertSiteSettings } from "@/lib/site-settings";
import { adminSiteSettingsBodySchema } from "@/lib/validation/site-settings";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await getPublicSiteSettings();
  return NextResponse.json({ settings });
}

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

  const parsed = adminSiteSettingsBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const before = await getPublicSiteSettings();
    const settings = await upsertSiteSettings(parsed.data);
    await logAdminAction({
      adminId: session.id,
      action: "site.settings",
      targetType: "site",
      targetId: "global",
      detail: {
        logoFrom: before.logoUrl,
        logoTo: settings.logoUrl,
        partnersCountFrom: before.partners.length,
        partnersCountTo: settings.partners.length,
      },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to update site settings";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
