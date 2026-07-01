import { NextResponse } from "next/server";
import { z } from "zod";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  generateCouponCode,
  isValidCouponCodeFormat,
  listWorkspaceCouponsForAdmin,
  normalizeCouponCode,
} from "@/lib/subscription/workspace-coupon";

const createSchema = z.object({
  code: z.string().min(3).max(40).optional(),
  label: z.string().max(120).optional(),
  durationDays: z.number().int().min(1).max(3650).optional(),
  maxRedemptions: z.number().int().min(1).max(10_000).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  autoGenerate: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const coupons = await listWorkspaceCouponsForAdmin();
  return NextResponse.json({ coupons });
}

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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const code = parsed.data.autoGenerate
    ? generateCouponCode("FRIEND")
    : normalizeCouponCode(parsed.data.code ?? "");

  if (!isValidCouponCodeFormat(code)) {
    return NextResponse.json(
      { error: "Code must be 3–32 characters: letters, numbers, hyphens." },
      { status: 400 },
    );
  }

  const existing = await prisma.workspaceCoupon.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "That coupon code already exists." }, { status: 409 });
  }

  const coupon = await prisma.workspaceCoupon.create({
    data: {
      code,
      label: parsed.data.label?.trim() || null,
      durationDays: parsed.data.durationDays ?? 30,
      maxRedemptions: parsed.data.maxRedemptions ?? 10,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}
