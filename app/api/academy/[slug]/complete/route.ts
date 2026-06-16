import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { markCourseComplete } from "@/lib/academy/courses";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const course = await prisma.academyCourse.findUnique({ where: { slug } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await markCourseComplete(session.id, course.id);
  return NextResponse.json({ completed: true });
}
