"use client";

import Link from "next/link";
import { useState } from "react";
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

type Lesson = { id: string; title: string; content: string; sortOrder: number };

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
  lessons: Lesson[];
  completed: boolean;
  hasSession: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState(initialCompleted);
  const [busy, setBusy] = useState(false);
  const active = lessons[activeIndex];
  const progressPct = lessons.length > 0 ? ((activeIndex + 1) / lessons.length) * 100 : 0;

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
    <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)] sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
              Lessons
            </p>
            <span className="text-xs font-semibold tabular-nums text-stone-500 dark:text-[var(--muted)]">
              {activeIndex + 1}/{lessons.length}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-[var(--surface-elevated)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <ol className="mt-4 space-y-1">
            {lessons.map((lesson, i) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={
                    i === activeIndex
                      ? "flex w-full items-start gap-2 rounded-xl bg-orange-50 px-3 py-2.5 text-left text-sm font-semibold text-orange-800 dark:bg-[var(--accent-muted)] dark:text-[var(--accent)]"
                      : "flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-stone-600 transition hover:bg-stone-50 dark:text-[var(--muted)] dark:hover:bg-[var(--background)]"
                  }
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[0.65rem] font-bold ${
                      i === activeIndex
                        ? "bg-orange-600 text-white dark:bg-[var(--accent)]"
                        : completed || i < activeIndex
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-stone-100 text-stone-500 dark:bg-[var(--surface-elevated)]"
                    }`}
                  >
                    {completed || i < activeIndex ? "✓" : i + 1}
                  </span>
                  <span className="min-w-0 leading-snug">{lesson.title}</span>
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
            ~{durationMinutes} min
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
            <div className="border-b border-stone-100 bg-stone-50 px-5 py-4 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/50 sm:px-6">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
                Lesson {activeIndex + 1}
              </p>
              <h2 className="mt-1 text-lg font-bold text-stone-900 dark:text-[var(--foreground)]">
                {active.title}
              </h2>
            </div>
            <div className="px-5 py-6 sm:px-6 sm:py-8">
              <div className="whitespace-pre-wrap text-base leading-[1.75] text-stone-800 dark:text-[var(--foreground)]">
                {active.content}
              </div>
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

        <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-[var(--border)] dark:bg-[var(--surface-elevated)]/40 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
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
                href="/app/builder"
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
