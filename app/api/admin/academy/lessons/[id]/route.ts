import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin/audit";
import { deleteAcademyLesson, updateAcademyLesson } from "@/lib/academy/academy";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { adminAcademyLessonUpdateSchema } from "@/lib/validation/academy";

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

  const parsed = adminAcademyLessonUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const lesson = await updateAcademyLesson(id, parsed.data);
    if (!lesson) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await logAdminAction({
      adminId: session.id,
      action: "academy.lesson.update",
      targetType: "academy_lesson",
      targetId: lesson.id,
    });
    return NextResponse.json({ lesson });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
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
    const deleted = await deleteAcademyLesson(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await logAdminAction({
      adminId: session.id,
      action: "academy.lesson.delete",
      targetType: "academy_lesson",
      targetId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}
