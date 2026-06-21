import { NextResponse } from "next/server";
import { TeamMemberKind } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { deleteTeamMember, updateTeamMember } from "@/lib/team";
import { adminTeamMemberUpdateSchema } from "@/lib/validation/team";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminTeamMemberUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const member = await updateTeamMember(id, {
      ...parsed.data,
      kind: parsed.data.kind as TeamMemberKind | undefined,
      avatarUrl:
        parsed.data.avatarUrl === undefined
          ? undefined
          : parsed.data.avatarUrl || null,
      monogram:
        parsed.data.monogram === undefined ? undefined : parsed.data.monogram || null,
    });
    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await logAdminAction({
      adminId: session.id,
      action: "team.member.update",
      targetType: "team_member",
      targetId: member.id,
    });
    return NextResponse.json({ member });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const deleted = await deleteTeamMember(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await logAdminAction({
      adminId: session.id,
      action: "team.member.delete",
      targetType: "team_member",
      targetId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
