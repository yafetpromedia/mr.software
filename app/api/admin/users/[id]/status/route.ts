import { NextResponse } from "next/server";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/admin/audit";
import {
  adminStatusBodySchema,
  adminUserIdParamSchema,
} from "@/lib/validation/admin-users";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: rawId } = await context.params;
  const idParsed = adminUserIdParamSchema.safeParse(rawId);
  if (!idParsed.success) {
    return NextResponse.json(
      { error: idParsed.error.issues[0]?.message ?? "Invalid user id" },
      { status: 400 },
    );
  }
  const id = idParsed.data;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminStatusBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          "Valid status is required (ACTIVE, RESTRICTED, SUSPENDED, BANNED)",
      },
      { status: 400 },
    );
  }
  const { status } = parsed.data;

  try {
    const before = await prisma.user.findUnique({
      where: { id },
      select: { status: true, email: true },
    });
    const user = await prisma.user.update({
      where: { id },
      data: { status, sessionVersion: { increment: 1 } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        canUpload: true,
        canPublish: true,
        canWithdraw: true,
      },
    });
    await logAdminAction({
      adminId: session.id,
      action: "user.status",
      targetType: "user",
      targetId: id,
      detail: { from: before?.status, to: status, email: before?.email },
    });
    return NextResponse.json({ user });
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      e.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
