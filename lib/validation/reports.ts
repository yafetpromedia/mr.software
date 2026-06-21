import { z } from "zod";

export const userReportReasonSchema = z.enum([
  "SPAM",
  "SCAM",
  "COPYRIGHT",
  "INAPPROPRIATE",
  "MISLEADING",
  "OTHER",
]);

export const userReportTargetTypeSchema = z.enum(["SOFTWARE", "STOREFRONT", "USER"]);

export const userReportStatusSchema = z.enum(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]);

export const createUserReportSchema = z.object({
  targetType: userReportTargetTypeSchema,
  targetId: z.string().trim().min(1).max(200),
  reason: userReportReasonSchema,
  details: z.string().trim().min(10).max(2000),
  resolveTarget: z.boolean().optional(),
});

export const adminUserReportUpdateSchema = z.object({
  status: userReportStatusSchema,
  resolution: z.string().trim().max(2000).optional().nullable(),
});
