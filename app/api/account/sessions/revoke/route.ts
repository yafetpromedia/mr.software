import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/cookie-options";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { sessionVersion: { increment: 1 } },
  });

  const res = NextResponse.json({ ok: true });
  const cookie = clearAuthCookie(request);
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
