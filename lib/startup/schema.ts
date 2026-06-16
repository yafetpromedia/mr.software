import { z } from "zod";

const pricingPlanSchema = z.object({
  name: z.string().min(1).max(80),
  price: z.string().min(1).max(40),
  description: z.string().max(200).optional(),
  highlighted: z.boolean().optional(),
});

const landingSectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    headline: z.string().min(1).max(200),
    subheadline: z.string().min(1).max(400),
    cta: z.string().min(1).max(80),
  }),
  z.object({
    type: z.literal("features"),
    title: z.string().min(1).max(120),
    items: z.array(z.string().min(1).max(200)).min(1).max(8),
  }),
  z.object({
    type: z.literal("pricing"),
    title: z.string().min(1).max(120),
    plans: z.array(pricingPlanSchema).min(1).max(4),
  }),
  z.object({
    type: z.literal("cta"),
    title: z.string().min(1).max(200),
    subtitle: z.string().min(1).max(400),
    button: z.string().min(1).max(80),
  }),
]);

export const generatedStartupPayloadSchema = z.object({
  name: z.string().min(1).max(80),
  tagline: z.string().min(1).max(200),
  features: z.array(z.string().min(1).max(200)).min(2).max(8),
  pricing: z.array(pricingPlanSchema).min(1).max(4),
  landingSections: z.array(landingSectionSchema).min(3).max(8),
  brand: z.object({
    primaryHue: z.number().min(0).max(360),
    label: z.string().min(1).max(40),
  }),
});

export const generateStartupBodySchema = z.object({
  idea: z.string().trim().min(3, "Describe your startup idea").max(2000),
  save: z.boolean().optional().default(true),
});

export type GeneratedStartupPayloadInput = z.infer<typeof generatedStartupPayloadSchema>;
