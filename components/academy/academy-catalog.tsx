import Link from "next/link";
import type { PublicAcademyCourse, PublicAcademySectionSettings } from "@/lib/academy/types";
import type { AcademyCourseLevel } from "@prisma/client";

const LEVEL_LABEL: Record<AcademyCourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const LEVEL_STYLE: Record<AcademyCourseLevel, string> = {
  BEGINNER: "bg-orange-100 text-orange-800 dark:bg-[var(--accent-muted)] dark:text-[var(--accent)]",
  INTERMEDIATE: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  ADVANCED: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};

const CARD_ACCENT = [
  "from-orange-500/25 via-amber-400/10 to-transparent",
  "from-violet-500/25 via-indigo-400/10 to-transparent",
  "from-emerald-500/25 via-teal-400/10 to-transparent",
  "from-sky-500/25 via-cyan-400/10 to-transparent",
] as const;

export function AcademyCatalog({
  settings,
  courses,
}: {
  settings: PublicAcademySectionSettings;
  courses: PublicAcademyCourse[];
}) {
  const totalLessons = courses.reduce((n, c) => n + c.lessonCount, 0);
  const totalMinutes = courses.reduce((n, c) => n + c.durationMinutes, 0);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full overflow-x-hidden border-t border-stone-200 bg-[var(--background)] dark:border-[var(--border)]">
      <div
        className="bg-grid-pattern pointer-events-none fixed inset-0 -z-10 opacity-20 [mask-image:radial-gradient(ellipse_100%_80%_at_50%_-10%,black_20%,transparent_70%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-orange-500/10 via-violet-500/5 to-transparent dark:from-[var(--accent)]/12" aria-hidden />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-orange-500/5 backdrop-blur-sm dark:border-[var(--border)] dark:bg-[var(--surface)]/90 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-orange-400/20 to-violet-400/10 blur-3xl" aria-hidden />
          <div className="relative max-w-3xl">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-[var(--accent)]">
              {settings.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-4xl lg:text-5xl">
              {settings.title}
            </h1>
            <p className="mt-2 text-lg font-medium text-stone-700 dark:text-[var(--foreground)]/90">
              {settings.tagline}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-[var(--muted)]">
              {settings.intro}
            </p>
          </div>

          {courses.length > 0 ? (
            <div className="relative mt-8 flex flex-wrap gap-3">
              {[
                { label: "Courses", value: String(courses.length), icon: "📚" },
                { label: "Lessons", value: String(totalLessons), icon: "📝" },
                { label: "Total time", value: `~${totalMinutes} min`, icon: "⏱" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white px-4 py-3 dark:border-[var(--border)] dark:bg-[var(--background)]"
                >
                  <span className="text-lg" aria-hidden>
                    {stat.icon}
                  </span>
                  <div>
                    <p className="text-lg font-bold tabular-nums text-stone-900 dark:text-[var(--foreground)]">
                      {stat.value}
                    </p>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {courses.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-600 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--muted)]">
            Courses are being prepared. Check back soon.
          </p>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <li key={course.id}>
                <Link
                  href={`/academy/${course.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:hover:border-[var(--accent)]/35"
                >
                  <div
                    className={`relative h-28 bg-gradient-to-br ${CARD_ACCENT[i % CARD_ACCENT.length]} p-5`}
                  >
                    <span
                      className={`absolute left-5 top-5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide backdrop-blur-sm ${LEVEL_STYLE[course.level]}`}
                    >
                      {LEVEL_LABEL[course.level]}
                    </span>
                    <p className="absolute bottom-4 left-5 right-5 text-xs font-semibold uppercase tracking-wider text-stone-600/80 dark:text-[var(--muted)]">
                      {course.lessonCount} lessons · ~{course.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h2 className="text-lg font-bold tracking-tight text-stone-900 transition group-hover:text-orange-600 dark:text-[var(--foreground)] dark:group-hover:text-[var(--accent)]">
                      {course.title}
                    </h2>
                    <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-stone-600 dark:text-[var(--muted)]">
                      {course.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-[var(--border)]">
                      <span className="text-xs font-medium text-stone-500 dark:text-[var(--muted)]">
                        Self-paced track
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 transition group-hover:gap-2 dark:text-[var(--accent)]">
                        Start course
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
