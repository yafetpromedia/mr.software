import { z } from "zod";

const partnerSchema = z.object({
  name: z.string().trim().min(1, "Partner name is required"),
  logo: z.string().trim().optional().or(z.literal("")),
  href: z.string().trim().optional().or(z.literal("")),
  label: z.string().trim().optional().or(z.literal("")),
});

export const adminSiteSettingsBodySchema = z.object({
  logoUrl: z
    .string()
    .trim()
    .min(1, "Logo URL is required")
    .regex(/^\//, "Logo URL must be a public path starting with /"),
  partners: z.array(partnerSchema).max(24, "Too many partner entries"),
});
