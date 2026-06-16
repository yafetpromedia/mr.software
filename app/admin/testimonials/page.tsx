import { AdminTestimonialsPanel } from "@/components/admin/admin-testimonials-panel";
import { countPendingTestimonials } from "@/lib/testimonials";

export const metadata = {
  title: "Testimonials",
};

export default async function AdminTestimonialsPage() {
  const pendingCount = await countPendingTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Testimonials
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Review stories submitted from the landing page. Approved testimonials appear under
          Partnerships on the home page.
          {pendingCount > 0 ? (
            <span className="ml-1 font-medium text-[var(--accent)]">
              {pendingCount} awaiting review.
            </span>
          ) : null}
        </p>
      </div>
      <AdminTestimonialsPanel />
    </div>
  );
}
