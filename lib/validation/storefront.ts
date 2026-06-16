import { z } from "zod";
import { validateHandle } from "@/lib/storefront/handles";
import { parseStorefrontTheme } from "@/lib/storefront/themes";

export const storefrontUpsertBodySchema = z.object({
  handle: z
    .string()
    .trim()
    .min(1, "Handle is required")
    .superRefine((value, ctx) => {
      const error = validateHandle(value);
      if (error) {
        ctx.addIssue({ code: "custom", message: error });
      }
    }),
  tagline: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(800).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  theme: z
    .string()
    .optional()
    .transform((value) => parseStorefrontTheme(value) ?? "CLASSIC"),
  showRevenuePublic: z.boolean().optional(),
});

export const adminStorefrontPatchSchema = z.object({
  verified: z.boolean().optional(),
  featured: z.boolean().optional(),
});
