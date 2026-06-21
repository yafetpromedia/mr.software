import { z } from "zod";

export const developerAccessRequestBodySchema = z.object({
  pitch: z
    .string()
    .trim()
    .min(20, "Tell us a bit more (at least 20 characters)")
    .max(2000, "Keep your pitch under 2000 characters"),
  website: z.string().trim().max(300).optional().or(z.literal("")),
});

export const adminDeveloperAccessPatchSchema = z.object({
  action: z.enum(["approve", "reject"]),
  adminNote: z.string().trim().max(1000).optional().or(z.literal("")),
});
