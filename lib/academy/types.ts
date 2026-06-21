import type { AcademyCourseLevel } from "@prisma/client";

export const DEFAULT_ACADEMY_SECTION = {
  eyebrow: "Mr.Software Academy",
  title: "Learn → build → publish",
  tagline: "From idea to live product on the marketplace.",
  intro:
    "Courses for developers and founders. Finish a track, then publish on the marketplace or open your storefront.",
} as const;

export type PublicAcademySectionSettings = {
  eyebrow: string;
  title: string;
  tagline: string;
  intro: string;
};

export type PublicAcademyCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: AcademyCourseLevel;
  durationMinutes: number;
  lessonCount: number;
};

export type PublicAcademyLesson = {
  id: string;
  title: string;
  summary: string;
  content: string;
  durationMinutes: number;
  sortOrder: number;
};

export type AcademyCourseDetail = PublicAcademyCourse & {
  lessons: PublicAcademyLesson[];
  completed: boolean;
};

export type AdminAcademyLesson = PublicAcademyLesson & {
  courseId: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminAcademyCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: AcademyCourseLevel;
  durationMinutes: number;
  published: boolean;
  sortOrder: number;
  lessonCount: number;
  lessons: AdminAcademyLesson[];
  createdAt: string;
  updatedAt: string;
};
