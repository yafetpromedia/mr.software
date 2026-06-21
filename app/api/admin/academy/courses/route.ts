import { NextResponse } from "next/server";
import { AcademyCourseLevel } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit";
import { createAcademyCourse } from "@/lib/academy/academy";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { adminAcademyCourseBodySchema } from "@/lib/validation/academy";

export async function POST(request: Request) {
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

  const parsed = adminAcademyCourseBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const course = await createAcademyCourse({
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description,
      level: parsed.data.level as AcademyCourseLevel,
      durationMinutes: parsed.data.durationMinutes,
      published: parsed.data.published,
      sortOrder: parsed.data.sortOrder,
    });
    await logAdminAction({
      adminId: session.id,
      action: "academy.course.create",
      targetType: "academy_course",
      targetId: course.id,
      detail: { title: course.title, slug: course.slug },
    });
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "A course with this slug already exists"
        : "Failed to create course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
