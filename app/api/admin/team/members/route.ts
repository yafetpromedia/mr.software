import { NextResponse } from "next/server";
import { TeamMemberKind } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { createTeamMember } from "@/lib/team";
import { adminTeamMemberBodySchema } from "@/lib/validation/team";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminTeamMemberBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const member = await createTeamMember({
      kind: parsed.data.kind as TeamMemberKind,
      name: parsed.data.name,
      role: parsed.data.role,
      bio: parsed.data.bio,
      avatarUrl: parsed.data.avatarUrl || null,
      monogram: parsed.data.monogram || null,
      published: parsed.data.published,
      sortOrder: parsed.data.sortOrder,
    });
    await logAdminAction({
      adminId: session.id,
      action: "team.member.create",
      targetType: "team_member",
      targetId: member.id,
      detail: { name: member.name, kind: member.kind },
    });
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
