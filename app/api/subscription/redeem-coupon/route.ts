import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { redeemWorkspaceCoupon } from "@/lib/subscription/workspace-coupon";

const bodySchema = z.object({
  code: z.string().min(3).max(40),
});

export async function POST(request: Request) {
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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid coupon code" },
      { status: 400 },
    );
  }

  const result = await redeemWorkspaceCoupon(session.id, parsed.data.code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    plan: "PRO",
    code: result.code,
    durationDays: result.durationDays,
    expiresAt: result.expiresAt.toISOString(),
  });
}
