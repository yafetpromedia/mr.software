import { FactoryStep } from "@prisma/client";
import { z } from "zod";

export const createFactorySessionSchema = z.object({
  idea: z.string().trim().min(3).max(4000),
});

export const patchFactorySessionSchema = z.object({
  currentStep: z.nativeEnum(FactoryStep).optional(),
  idea: z.string().trim().min(3).max(4000).optional(),
  conversationId: z.string().nullable().optional(),
  startupId: z.string().nullable().optional(),
  deploymentId: z.string().nullable().optional(),
  softwareId: z.string().nullable().optional(),
  markComplete: z.boolean().optional(),
});
