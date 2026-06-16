import type { AcademyCourse, AcademyCourseLevel, AcademyLesson } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicAcademyCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: AcademyCourseLevel;
  durationMinutes: number;
  lessonCount: number;
};

export type AcademyCourseDetail = PublicAcademyCourse & {
  lessons: AcademyLesson[];
  completed: boolean;
};

function toPublicCourse(
  row: AcademyCourse & { _count: { lessons: number } },
): PublicAcademyCourse {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    level: row.level,
    durationMinutes: row.durationMinutes,
    lessonCount: row._count.lessons,
  };
}

export async function listPublishedCourses(): Promise<PublicAcademyCourse[]> {
  const rows = await prisma.academyCourse.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: { _count: { select: { lessons: true } } },
  });
  return rows.map(toPublicCourse);
}

export async function getCourseBySlug(
  slug: string,
  userId?: string,
): Promise<AcademyCourseDetail | null> {
  const row = await prisma.academyCourse.findUnique({
    where: { slug },
    include: {
      lessons: { orderBy: { sortOrder: "asc" } },
      _count: { select: { lessons: true } },
    },
  });
  if (!row || !row.published) return null;

  let completed = false;
  if (userId) {
    const progress = await prisma.academyProgress.findUnique({
      where: { userId_courseId: { userId, courseId: row.id } },
    });
    completed = progress?.completed ?? false;
  }

  return {
    ...toPublicCourse(row),
    lessons: row.lessons,
    completed,
  };
}

export async function markCourseComplete(userId: string, courseId: string): Promise<void> {
  await prisma.academyProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: {
      userId,
      courseId,
      completed: true,
      completedAt: new Date(),
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
  });
}
