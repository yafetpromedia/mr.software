import { prisma } from "@/lib/prisma";

export async function logAdminAction(input: {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  detail?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? undefined,
        detail: input.detail === undefined ? undefined : (input.detail as object),
      },
    });
  } catch (e) {
    console.error("admin audit log failed", e);
  }
}
