import { NextResponse } from "next/server";
import { UserReportStatus } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { updateUserReport } from "@/lib/reports";
import { adminUserReportUpdateSchema } from "@/lib/validation/reports";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminUserReportUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const report = await updateUserReport(id, session.id, {
      status: parsed.data.status as UserReportStatus,
      resolution: parsed.data.resolution,
    });
    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await logAdminAction({
      adminId: session.id,
      action: "report.update",
      targetType: "user_report",
      targetId: report.id,
      detail: { status: report.status },
    });
    return NextResponse.json({ report });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to update report";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
