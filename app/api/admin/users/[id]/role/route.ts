import { NextResponse } from "next/server";
import { Role, UserStatus } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import {
  adminRoleBodySchema,
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

  const bodyParsed = adminRoleBodySchema.safeParse(body);
  if (!bodyParsed.success) {
    return NextResponse.json(
      {
        error:
          bodyParsed.error.issues[0]?.message ??
          "Valid role is required (USER, DEVELOPER, ADMIN)",
      },
      { status: 400 },
    );
  }
  const { role } = bodyParsed.data;

  if (id === session.id && role !== Role.ADMIN) {
    const otherAdmins = await prisma.user.count({
      where: {
        id: { not: session.id },
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    if (otherAdmins === 0) {
      return NextResponse.json(
        { error: "Cannot demote the only active administrator" },
        { status: 400 },
      );
    }
  }

  if (id !== session.id && role !== Role.ADMIN) {
    const targetIsAdmin = await prisma.user.findUnique({
      where: { id },
      select: { role: true, status: true },
    });
    if (targetIsAdmin?.role === Role.ADMIN && targetIsAdmin?.status === UserStatus.ACTIVE) {
      const otherAdmins = await prisma.user.count({
        where: {
          id: { not: id },
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });
      if (otherAdmins === 0) {
        return NextResponse.json(
          { error: "Cannot change role: this is the only active administrator" },
          { status: 400 },
        );
      }
    }
  }

  try {
    const before = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true },
    });
    if (!before) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role, sessionVersion: { increment: 1 } },
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
      action: "user.role",
      targetType: "user",
      targetId: id,
      detail: { from: before.role, to: role, email: before.email },
    });
    return NextResponse.json({ user });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
