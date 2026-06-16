import { NextResponse } from "next/server";
import { withRefreshedSessionCookie } from "@/lib/auth/refresh-session-cookie";
import { getSession } from "@/lib/auth/session";
import { userFacingDbError } from "@/lib/db-errors";
import { accountProfileSchema } from "@/lib/validation/account";
import { prisma } from "@/lib/prisma";

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  canUpload: true,
  canPublish: true,
  canWithdraw: true,
  sessionVersion: true,
  googleId: true,
  password: true,
  createdAt: true,
} as const;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: userSelect,
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: Boolean(user.password),
      hasGoogle: Boolean(user.googleId),
      memberSince: user.createdAt.toISOString(),
    },
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = accountProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
      },
      select: userSelect,
    });

    const res = NextResponse.json({
      profile: {
        name: updated.name,
        email: updated.email,
        role: updated.role,
        hasPassword: Boolean(updated.password),
        hasGoogle: Boolean(updated.googleId),
        memberSince: updated.createdAt.toISOString(),
      },
    });
    return withRefreshedSessionCookie(res, updated);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
    }
    console.error(e);
    const hint = userFacingDbError(e);
    return NextResponse.json({ error: hint ?? "Failed to update profile" }, { status: 500 });
  }
}
