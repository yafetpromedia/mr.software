import { z } from "zod";
import { getEmailPolicyError } from "@/lib/validation/email-policy";

export const emailField = z
  .string()
  .trim()
  .max(320, "Email is too long")
  .email("Enter a valid email address")
  .transform((s) => s.toLowerCase())
  .superRefine((email, ctx) => {
    const policyError = getEmailPolicyError(email);
    if (policyError) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: policyError });
    }
  });
