import { z } from "zod";
import type { SoftwareCategory } from "@prisma/client";
import { SOFTWARE_CATEGORIES } from "@/lib/marketplace/categories";

const categoryEnum = z.enum(SOFTWARE_CATEGORIES as [SoftwareCategory, ...SoftwareCategory[]]);

export const listingUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(10000).optional(),
  category: categoryEnum.optional(),
  pricingModel: z.enum(["FREE", "ONE_TIME", "SUBSCRIPTION"]).optional(),
  price: z.string().trim().min(1).max(80).optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().trim().min(2).max(8).optional(),
  thumbnailUrl: z.string().trim().max(2048).nullable().optional(),
  playStoreUrl: z.string().trim().max(2048).nullable().optional(),
  appStoreUrl: z.string().trim().max(2048).nullable().optional(),
  published: z.boolean().optional(),
});

export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
