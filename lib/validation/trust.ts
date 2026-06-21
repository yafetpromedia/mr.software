import { z } from "zod";

export const verifyLicenseSchema = z.object({
  licenseKey: z.string().trim().min(8).max(32),
  /** Optional domain check for web/self-hosted installs (e.g. school.edu.et) */
  domain: z.string().trim().max(253).optional(),
});
