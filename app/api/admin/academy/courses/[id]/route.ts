import { NextResponse } from "next/server";
import { AcademyCourseLevel } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit";
import { deleteAcademyCourse, updateAcademyCourse } from "@/lib/academy/academy";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { adminAcademyCourseUpdateSchema } from "@/lib/validation/academy";

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

  const parsed = adminAcademyCourseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const course = await updateAcademyCourse(id, {
      ...parsed.data,
      level: parsed.data.level as AcademyCourseLevel | undefined,
    });
    if (!course) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await logAdminAction({
      adminId: session.id,
      action: "academy.course.update",
      targetType: "academy_course",
      targetId: course.id,
    });
    return NextResponse.json({ course });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "A course with this slug already exists"
        : "Failed to update course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const deleted = await deleteAcademyCourse(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await logAdminAction({
      adminId: session.id,
      action: "academy.course.delete",
      targetType: "academy_course",
      targetId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
