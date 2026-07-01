import { NextResponse } from "next/server";
import { z } from "zod";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  active: z.boolean().optional(),
  label: z.string().max(120).optional().nullable(),
  maxRedemptions: z.number().int().min(1).max(10_000).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const existing = await prisma.workspaceCoupon.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  const coupon = await prisma.workspaceCoupon.update({
    where: { id },
    data: {
      ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}),
      ...(parsed.data.label !== undefined ? { label: parsed.data.label?.trim() || null } : {}),
      ...(parsed.data.maxRedemptions !== undefined
        ? { maxRedemptions: parsed.data.maxRedemptions }
        : {}),
      ...(parsed.data.expiresAt !== undefined
        ? { expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null }
        : {}),
    },
  });

  return NextResponse.json({ coupon });
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

  const existing = await prisma.workspaceCoupon.findUnique({
    where: { id },
    select: { redemptionCount: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  if (existing.redemptionCount > 0) {
    await prisma.workspaceCoupon.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ ok: true, deactivated: true });
  }

  await prisma.workspaceCoupon.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: true });
}
