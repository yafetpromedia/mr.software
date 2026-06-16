import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyCourseClient } from "@/components/academy/academy-course-client";
import { getCourseBySlug } from "@/lib/academy/courses";
import { getSession } from "@/lib/auth/session";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course not found" };
  return { title: course.title, description: course.description };
}

export default async function AcademyCoursePage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  const course = await getCourseBySlug(slug, session?.id);
  if (!course) notFound();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full overflow-x-hidden border-t border-stone-200 bg-[var(--background)] dark:border-[var(--border)]">
      <div
        className="bg-grid-pattern pointer-events-none fixed inset-0 -z-10 opacity-20 [mask-image:radial-gradient(ellipse_100%_80%_at_50%_-10%,black_20%,transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--foreground)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Academy
        </Link>
        <div className="mt-6">
          <AcademyCourseClient
            slug={course.slug}
            title={course.title}
            description={course.description}
            level={course.level}
            durationMinutes={course.durationMinutes}
            lessons={course.lessons}
            completed={course.completed}
            hasSession={Boolean(session)}
          />
        </div>
      </div>
    </div>
  );
}
