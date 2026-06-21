import { z } from "zod";

export const academyCourseLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

export const adminAcademySectionSettingsSchema = z.object({
  eyebrow: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(160),
  intro: z.string().trim().min(1).max(1200),
});

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

export const adminAcademyCourseBodySchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  level: academyCourseLevelSchema,
  durationMinutes: z.number().int().min(5).max(600).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const adminAcademyCourseUpdateSchema = adminAcademyCourseBodySchema.partial();

export const adminAcademyLessonBodySchema = z.object({
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1).max(50000),
  durationMinutes: z.number().int().min(1).max(120).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const adminAcademyLessonUpdateSchema = adminAcademyLessonBodySchema.partial();
