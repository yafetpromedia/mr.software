import type {
  AcademyCourse,
  AcademyCourseLevel,
  AcademyLesson,
  AcademySectionSettings,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_ACADEMY_SECTION,
  type AdminAcademyCourse,
  type AdminAcademyLesson,
  type AcademyCourseDetail,
  type PublicAcademyCourse,
  type PublicAcademyLesson,
  type PublicAcademySectionSettings,
} from "@/lib/academy/types";

export type {
  AdminAcademyCourse,
  AdminAcademyLesson,
  AcademyCourseDetail,
  PublicAcademyCourse,
  PublicAcademyLesson,
  PublicAcademySectionSettings,
} from "@/lib/academy/types";

const SETTINGS_ID = 1;

function toPublicSettings(row: AcademySectionSettings): PublicAcademySectionSettings {
  return {
    eyebrow: row.eyebrow,
    title: row.title,
    tagline: row.tagline,
    intro: row.intro,
  };
}

function toPublicLesson(row: AcademyLesson): PublicAcademyLesson {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    durationMinutes: row.durationMinutes,
    sortOrder: row.sortOrder,
  };
}

function toAdminLesson(row: AcademyLesson): AdminAcademyLesson {
  return {
    ...toPublicLesson(row),
    courseId: row.courseId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

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

function toAdminCourse(
  row: AcademyCourse & { lessons: AcademyLesson[]; _count: { lessons: number } },
): AdminAcademyCourse {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    level: row.level,
    durationMinutes: row.durationMinutes,
    published: row.published,
    sortOrder: row.sortOrder,
    lessonCount: row._count.lessons,
    lessons: row.lessons.map(toAdminLesson),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function academySettingsDb():
  | {
      findUnique: (args: {
        where: { id: number };
      }) => Promise<AcademySectionSettings | null>;
      upsert: (args: {
        where: { id: number };
        create: { id: number } & PublicAcademySectionSettings;
        update: PublicAcademySectionSettings;
      }) => Promise<AcademySectionSettings>;
    }
  | null {
  const delegate = (
    prisma as unknown as {
      academySectionSettings?: {
        findUnique?: (args: {
          where: { id: number };
        }) => Promise<AcademySectionSettings | null>;
        upsert?: (args: {
          where: { id: number };
          create: { id: number } & PublicAcademySectionSettings;
          update: PublicAcademySectionSettings;
        }) => Promise<AcademySectionSettings>;
      };
    }
  ).academySectionSettings;
  if (!delegate?.findUnique || !delegate?.upsert) return null;
  return delegate as NonNullable<typeof delegate> & {
    findUnique: NonNullable<typeof delegate.findUnique>;
    upsert: NonNullable<typeof delegate.upsert>;
  };
}

async function loadAcademySettings(): Promise<PublicAcademySectionSettings> {
  const db = academySettingsDb();
  if (!db) return DEFAULT_ACADEMY_SECTION;
  try {
    const existing = await db.findUnique({ where: { id: SETTINGS_ID } });
    if (existing) return toPublicSettings(existing);
    const created = await db.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        ...DEFAULT_ACADEMY_SECTION,
      },
      update: {},
    });
    return toPublicSettings(created);
  } catch {
    return DEFAULT_ACADEMY_SECTION;
  }
}

async function ensureAcademySectionSettings(): Promise<AcademySectionSettings | null> {
  const db = academySettingsDb();
  if (!db) return null;
  return db.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      ...DEFAULT_ACADEMY_SECTION,
    },
    update: {},
  });
}

export async function getPublicAcademySection(): Promise<{
  settings: PublicAcademySectionSettings;
  courses: PublicAcademyCourse[];
}> {
  const [settings, courseRows] = await Promise.all([
    loadAcademySettings(),
    prisma.academyCourse.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: { _count: { select: { lessons: true } } },
    }),
  ]);

  return {
    settings,
    courses: courseRows.map(toPublicCourse),
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
    lessons: row.lessons.map(toPublicLesson),
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

export async function getAcademyForAdmin(): Promise<{
  settings: PublicAcademySectionSettings;
  courses: AdminAcademyCourse[];
}> {
  const [settings, courseRows] = await Promise.all([
    loadAcademySettings(),
    prisma.academyCourse.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: {
        lessons: { orderBy: { sortOrder: "asc" } },
        _count: { select: { lessons: true } },
      },
    }),
  ]);

  return {
    settings,
    courses: courseRows.map(toAdminCourse),
  };
}

export async function upsertAcademySectionSettings(
  input: PublicAcademySectionSettings,
): Promise<PublicAcademySectionSettings> {
  const db = academySettingsDb();
  if (!db) {
    throw new Error(
      "Academy settings model unavailable. Restart the dev server after pulling schema changes.",
    );
  }
  const row = await db.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      ...input,
    },
    update: input,
  });
  return toPublicSettings(row);
}

export async function createAcademyCourse(input: {
  slug: string;
  title: string;
  description: string;
  level: AcademyCourseLevel;
  durationMinutes?: number;
  published?: boolean;
  sortOrder?: number;
}): Promise<AdminAcademyCourse> {
  const maxSort = await prisma.academyCourse.aggregate({ _max: { sortOrder: true } });
  const row = await prisma.academyCourse.create({
    data: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      level: input.level,
      durationMinutes: input.durationMinutes ?? 60,
      published: input.published ?? false,
      sortOrder: input.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
    },
    include: {
      lessons: { orderBy: { sortOrder: "asc" } },
      _count: { select: { lessons: true } },
    },
  });
  return toAdminCourse(row);
}

export async function updateAcademyCourse(
  id: string,
  input: Partial<{
    slug: string;
    title: string;
    description: string;
    level: AcademyCourseLevel;
    durationMinutes: number;
    published: boolean;
    sortOrder: number;
  }>,
): Promise<AdminAcademyCourse | null> {
  const existing = await prisma.academyCourse.findUnique({ where: { id } });
  if (!existing) return null;

  const row = await prisma.academyCourse.update({
    where: { id },
    data: input,
    include: {
      lessons: { orderBy: { sortOrder: "asc" } },
      _count: { select: { lessons: true } },
    },
  });
  return toAdminCourse(row);
}

export async function deleteAcademyCourse(id: string): Promise<boolean> {
  const existing = await prisma.academyCourse.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.academyCourse.delete({ where: { id } });
  return true;
}

export async function createAcademyLesson(
  courseId: string,
  input: {
    title: string;
    summary?: string;
    content: string;
    durationMinutes?: number;
    sortOrder?: number;
  },
): Promise<AdminAcademyLesson | null> {
  const course = await prisma.academyCourse.findUnique({ where: { id: courseId } });
  if (!course) return null;

  const maxSort = await prisma.academyLesson.aggregate({
    where: { courseId },
    _max: { sortOrder: true },
  });

  const row = await prisma.academyLesson.create({
    data: {
      courseId,
      title: input.title,
      summary: input.summary?.trim() ?? "",
      content: input.content,
      durationMinutes: input.durationMinutes ?? 10,
      sortOrder: input.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
    },
  });
  return toAdminLesson(row);
}

export async function updateAcademyLesson(
  id: string,
  input: Partial<{
    title: string;
    summary: string;
    content: string;
    durationMinutes: number;
    sortOrder: number;
  }>,
): Promise<AdminAcademyLesson | null> {
  const existing = await prisma.academyLesson.findUnique({ where: { id } });
  if (!existing) return null;

  const row = await prisma.academyLesson.update({
    where: { id },
    data: {
      title: input.title,
      summary: input.summary,
      content: input.content,
      durationMinutes: input.durationMinutes,
      sortOrder: input.sortOrder,
    },
  });
  return toAdminLesson(row);
}

export async function deleteAcademyLesson(id: string): Promise<boolean> {
  const existing = await prisma.academyLesson.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.academyLesson.delete({ where: { id } });
  return true;
}

export async function ensureAcademyDefaults(): Promise<void> {
  await ensureAcademySectionSettings();
}
