import { TestimonialStatus, type Testimonial } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicTestimonial = {
  id: string;
  name: string;
  role?: string;
  company?: string;
  quote: string;
  rating?: number;
};

export type AdminTestimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number | null;
  email: string | null;
  status: TestimonialStatus;
  sortOrder: number;
  submittedAt: string;
  reviewedAt: string | null;
};

function toPublicTestimonial(row: Testimonial): PublicTestimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? undefined,
    company: row.company ?? undefined,
    quote: row.quote,
    rating: row.rating ?? undefined,
  };
}

function toAdminTestimonial(row: Testimonial): AdminTestimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    company: row.company,
    quote: row.quote,
    rating: row.rating,
    email: row.email,
    status: row.status,
    sortOrder: row.sortOrder,
    submittedAt: row.submittedAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  };
}

export async function getApprovedTestimonials(): Promise<PublicTestimonial[]> {
  const rows = await prisma.testimonial.findMany({
    where: { status: TestimonialStatus.APPROVED },
    orderBy: [{ sortOrder: "asc" }, { reviewedAt: "desc" }, { submittedAt: "desc" }],
    take: 24,
  });
  return rows.map(toPublicTestimonial);
}

export async function createTestimonial(input: {
  name: string;
  role?: string;
  company?: string;
  quote: string;
  rating?: number | null;
  email?: string;
}): Promise<{ id: string }> {
  const row = await prisma.testimonial.create({
    data: {
      name: input.name,
      role: input.role || null,
      company: input.company || null,
      quote: input.quote,
      rating: input.rating ?? null,
      email: input.email || null,
    },
    select: { id: true },
  });
  return row;
}

export async function listTestimonialsForAdmin(
  statusFilter?: TestimonialStatus | "ALL",
): Promise<AdminTestimonial[]> {
  const rows = await prisma.testimonial.findMany({
    where:
      statusFilter && statusFilter !== "ALL"
        ? { status: statusFilter }
        : undefined,
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    take: 100,
  });
  return rows.map(toAdminTestimonial);
}

export async function updateTestimonialStatus(
  id: string,
  status: TestimonialStatus,
  reviewedById: string,
): Promise<AdminTestimonial | null> {
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) return null;

  const sortOrder =
    status === TestimonialStatus.APPROVED
      ? (
          await prisma.testimonial.aggregate({
            where: { status: TestimonialStatus.APPROVED },
            _max: { sortOrder: true },
          })
        )._max.sortOrder ?? 0
      : existing.sortOrder;

  const row = await prisma.testimonial.update({
    where: { id },
    data: {
      status,
      reviewedAt: new Date(),
      reviewedById,
      sortOrder: status === TestimonialStatus.APPROVED ? sortOrder + 1 : 0,
    },
  });
  return toAdminTestimonial(row);
}

export async function countPendingTestimonials(): Promise<number> {
  return prisma.testimonial.count({
    where: { status: TestimonialStatus.PENDING },
  });
}
