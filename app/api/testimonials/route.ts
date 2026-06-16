import { NextResponse } from "next/server";
import { createTestimonial } from "@/lib/testimonials";
import { submitTestimonialBodySchema } from "@/lib/validation/testimonials";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = submitTestimonialBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, role, company, quote, rating, email } = parsed.data;

  try {
    const created = await createTestimonial({
      name,
      role: role || undefined,
      company: company || undefined,
      quote,
      rating: rating ?? null,
      email: email || undefined,
    });
    return NextResponse.json(
      {
        id: created.id,
        message: "Thanks! Your testimonial is pending review.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not submit testimonial. Please try again." },
      { status: 500 },
    );
  }
}
