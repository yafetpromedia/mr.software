import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .max(320)
  .email("Valid email is required")
  .transform((s) => s.toLowerCase());

export const loginBodySchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required").max(1024),
});

export const registerBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: emailField,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password is too long"),
});
