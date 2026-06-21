import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin/audit";
import { createAcademyLesson } from "@/lib/academy/academy";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { adminAcademyLessonBodySchema } from "@/lib/validation/academy";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: courseId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminAcademyLessonBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const lesson = await createAcademyLesson(courseId, {
      title: parsed.data.title,
      summary: parsed.data.summary,
      content: parsed.data.content,
      durationMinutes: parsed.data.durationMinutes,
      sortOrder: parsed.data.sortOrder,
    });
    if (!lesson) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    await logAdminAction({
      adminId: session.id,
      action: "academy.lesson.create",
      targetType: "academy_lesson",
      targetId: lesson.id,
      detail: { courseId, title: lesson.title },
    });
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
