import { z } from "zod";

export const teamMemberKindSchema = z.enum(["HUMAN", "AI_CAPABILITY", "ECOSYSTEM"]);

export const adminTeamSectionSettingsSchema = z.object({
  eyebrow: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(160),
  intro: z.string().trim().min(1).max(800),
});

export const adminTeamMemberBodySchema = z.object({
  kind: teamMemberKindSchema,
  name: z.string().trim().min(1).max(80),
  role: z.string().trim().min(1).max(120),
  bio: z.string().trim().min(1).max(600),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .or(z.literal("")),
  monogram: z
    .string()
    .trim()
    .max(4)
    .optional()
    .nullable()
    .or(z.literal("")),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const adminTeamMemberUpdateSchema = adminTeamMemberBodySchema.partial();
