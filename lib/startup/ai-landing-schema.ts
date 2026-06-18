import { z } from "zod";

function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

const pricingPlanLoose = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  description: z.string().optional(),
  highlighted: z.boolean().optional(),
});

/** Parse AI output — trim only, never inject content. */
export const aiLandingPayloadSchema = z
  .object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    features: z.array(z.string().min(1)).min(1),
    pricing: z.array(pricingPlanLoose).min(1),
    landingSections: z.array(z.unknown()).min(1),
    brand: z.object({
      primaryHue: z.number(),
      label: z.string().min(1),
      enable3d: z.boolean().optional(),
      visualStyle: z.enum(["modern", "minimal", "bold"]).optional(),
    }),
  })
  .transform((data) => ({
    name: clip(data.name, 80),
    tagline: clip(data.tagline, 200),
    features: data.features.slice(0, 8).map((f) => clip(f, 200)),
    pricing: data.pricing.slice(0, 4).map((p) => ({
      name: clip(p.name, 80),
      price: clip(p.price, 40),
      description: p.description ? clip(p.description, 200) : undefined,
      highlighted: p.highlighted,
    })),
    landingSections: data.landingSections,
    brand: {
      primaryHue: Math.min(360, Math.max(0, data.brand.primaryHue)),
      label: clip(data.brand.label, 40),
      enable3d: data.brand.enable3d,
      visualStyle: data.brand.visualStyle,
    },
  }));
