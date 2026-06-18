import { z } from "zod";

export const copilotRequestSchema = z.object({
  message: z.string().trim().min(1, "Enter a message").max(4000),
  conversationId: z.string().optional(),
});

export const copilotMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.string(),
});
