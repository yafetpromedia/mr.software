import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/cookie-options";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const cookie = clearAuthCookie();
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
