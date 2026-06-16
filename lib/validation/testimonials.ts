import { z } from "zod";

export const submitTestimonialBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  role: z.string().trim().max(80).optional().or(z.literal("")),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  quote: z
    .string()
    .trim()
    .min(20, "Please share at least a short sentence")
    .max(600, "Keep your testimonial under 600 characters"),
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(120)
    .optional()
    .or(z.literal("")),
});

export const adminTestimonialStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
});

export const adminTestimonialListQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "ALL"]).optional(),
});
