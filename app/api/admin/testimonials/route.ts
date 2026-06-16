import { NextResponse } from "next/server";
import { TestimonialStatus } from "@prisma/client";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { countPendingTestimonials, listTestimonialsForAdmin } from "@/lib/testimonials";
import { adminTestimonialListQuerySchema } from "@/lib/validation/testimonials";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isActiveAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = adminTestimonialListQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  const statusFilter = parsed.data.status ?? "PENDING";
  const testimonials = await listTestimonialsForAdmin(
    statusFilter === "ALL" ? "ALL" : (statusFilter as TestimonialStatus),
  );
  const pendingCount = await countPendingTestimonials();

  return NextResponse.json({ testimonials, pendingCount });
}
