import { z } from "zod";
import { Role, UserStatus } from "@prisma/client";

const statuses = [UserStatus.ACTIVE, UserStatus.RESTRICTED, UserStatus.SUSPENDED, UserStatus.BANNED] as const;
const roles = [Role.USER, Role.DEVELOPER, Role.ADMIN] as const;

export const adminUserIdParamSchema = z.string().uuid("Invalid user id");

export const adminStatusBodySchema = z.object({
  status: z.enum(statuses),
});

export const adminRoleBodySchema = z.object({
  role: z.enum(roles),
});

export const adminPermissionsBodySchema = z.object({
  canUpload: z.boolean(),
  canPublish: z.boolean(),
  canWithdraw: z.boolean(),
});
