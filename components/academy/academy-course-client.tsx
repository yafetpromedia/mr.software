"use client";

import Link from "next/link";
import { useState } from "react";
import { LessonContent } from "@/components/academy/lesson-content";
import type { PublicAcademyLesson } from "@/lib/academy/types";
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

export function AcademyCourseClient({
  slug,
  title,
  description,
  level,
  durationMinutes,
  lessons,
  completed: initialCompleted,
  hasSession,
}: {
  slug: string;
  title: string;
  description: string;
  level: AcademyCourseLevel;
  durationMinutes: number;
  lessons: PublicAcademyLesson[];
  completed: boolean;
  hasSession: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState(initialCompleted);
  const [busy, setBusy] = useState(false);
  const active = lessons[activeIndex];
  const progressPct = lessons.length > 0 ? ((activeIndex + 1) / lessons.length) * 100 : 0;
  const lessonMinutes = lessons.reduce((n, l) => n + l.durationMinutes, 0);

  async function markComplete() {
    if (!hasSession) {
      window.location.href = `/auth/login?next=/academy/${slug}`;
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/academy/${slug}/complete`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) setCompleted(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
          <div className="bg-gradient-to-br from-orange-500/15 via-amber-400/5 to-transparent p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-[var(--muted)]">
                Course outline
              </p>
              <span className="text-xs font-semibold tabular-nums text-stone-500 dark:text-[var(--muted)]">
                {activeIndex + 1}/{lessons.length}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/60 dark:bg-[var(--surface-elevated)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-[0.65rem] font-medium text-stone-500 dark:text-[var(--muted)]">
              {Math.round(progressPct)}% complete
            </p>
          </div>
          <ol className="max-h-[min(28rem,60vh)] space-y-0.5 overflow-y-auto p-2 sm:p-3">
            {lessons.map((lesson, i) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={
                    i === activeIndex
                      ? "flex w-full items-start gap-2.5 rounded-xl bg-orange-50 px-3 py-3 text-left dark:bg-[var(--accent-muted)]"
                      : "flex w-full items-start gap-2.5 rounded-xl px-3 py-3 text-left transition hover:bg-stone-50 dark:hover:bg-[var(--background)]"
                  }
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[0.65rem] font-bold ${
                      i === activeIndex
                        ? "bg-orange-600 text-white dark:bg-[var(--accent)]"
                        : completed || i < activeIndex
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-stone-100 text-stone-500 dark:bg-[var(--surface-elevated)]"
                    }`}
                  >
                    {completed || i < activeIndex ? "✓" : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold leading-snug ${
                        i === activeIndex
                          ? "text-orange-800 dark:text-[var(--accent)]"
                          : "text-stone-800 dark:text-[var(--foreground)]"
                      }`}
                    >
                      {lesson.title}
                    </span>
                    {lesson.summary ? (
                      <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-[var(--muted)]">
                        {lesson.summary}
                      </span>
                    ) : null}
                    <span className="mt-1 block text-[0.65rem] font-medium text-stone-400 dark:text-[var(--muted)]">
                      ~{lesson.durationMinutes} min
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </aside>

      <article className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${LEVEL_STYLE[level]}`}>
            {LEVEL_LABEL[level]}
          </span>
          <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--muted)]">
            {lessons.length} lessons · ~{lessonMinutes || durationMinutes} min
          </span>
          {completed ? (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
              ✓ Completed
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-[var(--muted)]">
          {description}
        </p>

        {active ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
            <div className="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-orange-50/30 px-5 py-5 dark:border-[var(--border)] dark:from-[var(--surface-elevated)]/50 dark:to-[var(--accent-muted)]/20 sm:px-7">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                  Lesson {activeIndex + 1} of {lessons.length}
                </p>
                <span className="text-stone-300 dark:text-[var(--border)]">·</span>
                <p className="text-[0.65rem] font-semibold text-stone-500 dark:text-[var(--muted)]">
                  ~{active.durationMinutes} min read
                </p>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-stone-900 dark:text-[var(--foreground)] sm:text-2xl">
                {active.title}
              </h2>
              {active.summary ? (
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-[var(--muted)]">
                  {active.summary}
                </p>
              ) : null}
            </div>
            <div className="px-5 py-6 sm:px-7 sm:py-8">
              <LessonContent content={active.content} />
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            className="inline-flex h-10 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition hover:border-stone-300 disabled:opacity-40 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--foreground)]"
          >
            ← Previous
          </button>
          {activeIndex < lessons.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveIndex((i) => Math.min(lessons.length - 1, i + 1))}
              className="inline-flex h-10 items-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-500 dark:bg-[var(--accent)] dark:hover:bg-[var(--accent-hover)]"
            >
              Next lesson →
            </button>
          ) : null}
        </div>

        <div className="mt-8 rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-orange-50/40 p-5 dark:border-[var(--border)] dark:from-[var(--surface-elevated)]/40 dark:to-[var(--accent-muted)]/20 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div>
            <p className="text-sm font-bold text-stone-900 dark:text-[var(--foreground)]">
              {completed ? "Course complete — ship your product" : "Finish this track"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-[var(--muted)]">
              {completed
                ? "Open the builder or list on the marketplace when you're ready."
                : "Mark complete to track progress on your account."}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0">
            {!completed ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void markComplete()}
                className="inline-flex h-11 items-center rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60 dark:bg-[var(--foreground)] dark:text-[var(--background)]"
              >
                {busy ? "Saving…" : "Mark complete"}
              </button>
            ) : (
              <Link
                href="/app/ai/blueprint"
                className="inline-flex h-11 items-center rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-500 dark:bg-[var(--accent)]"
              >
                Open builder →
              </Link>
            )}
            <Link
              href="/marketplace"
              className="inline-flex h-11 items-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-800 transition hover:border-orange-300 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--foreground)]"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
