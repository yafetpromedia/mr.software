import { NextResponse } from "next/server";
import { withRefreshedSessionCookie } from "@/lib/auth/refresh-session-cookie";
import { getSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { accountPasswordSchema } from "@/lib/validation/account";
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
  password: true,
} as const;

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rl = checkRateLimit(`account-password:${session.id}`, 5, 900_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = accountPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: userSelect,
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.password) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }
    const ok = await verifyPassword(parsed.data.currentPassword, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  const updated = await prisma.user.update({
    where: { id: session.id },
    data: { password: passwordHash },
    select: userSelect,
  });

  const res = NextResponse.json({ ok: true });
  return withRefreshedSessionCookie(res, updated);
}
