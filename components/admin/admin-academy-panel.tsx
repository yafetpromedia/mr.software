"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AcademyCourseLevel } from "@prisma/client";
import type { AdminAcademyCourse, PublicAcademySectionSettings } from "@/lib/academy/types";
import { DEFAULT_ACADEMY_SECTION } from "@/lib/academy/types";
import { slugifyAcademyTitle } from "@/lib/academy/slug";

type CourseLevel = AcademyCourseLevel;

const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

function emptyCourse(sortOrder: number) {
  return {
    slug: "",
    title: "",
    description: "",
    level: "BEGINNER" as CourseLevel,
    durationMinutes: 60,
    published: false,
    sortOrder,
  };
}

function emptyLesson(sortOrder: number) {
  return {
    title: "",
    summary: "",
    content: "",
    durationMinutes: 10,
    sortOrder,
  };
}

function levelBadge(level: CourseLevel) {
  const styles = {
    BEGINNER: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
    INTERMEDIATE: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
    ADVANCED: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  } as const;
  const labels = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${styles[level]}`}
    >
      {labels[level]}
    </span>
  );
}

export function AdminAcademyPanel() {
  const [settings, setSettings] = useState<PublicAcademySectionSettings | null>(null);
  const [courses, setCourses] = useState<AdminAcademyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | "new" | null>(null);
  const [courseDraft, setCourseDraft] = useState(emptyCourse(1));
  const [savingCourse, setSavingCourse] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | "new" | null>(null);
  const [lessonDraft, setLessonDraft] = useState(emptyLesson(1));
  const [lessonCourseId, setLessonCourseId] = useState<string | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/academy", { credentials: "include" });
      const data = (await res.json()) as {
        error?: string;
        settings?: PublicAcademySectionSettings;
        courses?: AdminAcademyCourse[];
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load academy");
      setSettings(data.settings ?? DEFAULT_ACADEMY_SECTION);
      setCourses(data.courses ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load academy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings() {
    const payload = settings ?? DEFAULT_ACADEMY_SECTION;
    setSavingSettings(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/academy/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; settings?: PublicAcademySectionSettings };
      if (!res.ok) throw new Error(data.error ?? "Failed to save settings");
      setSettings(data.settings ?? settings);
      setMessage("Academy page copy saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  function startCreateCourse() {
    setEditingCourseId("new");
    setCourseDraft({
      ...emptyCourse(courses.length > 0 ? Math.max(...courses.map((c) => c.sortOrder)) + 1 : 1),
    });
    setMessage("");
  }

  function startEditCourse(course: AdminAcademyCourse) {
    setEditingCourseId(course.id);
    setCourseDraft({
      slug: course.slug,
      title: course.title,
      description: course.description,
      level: course.level,
      durationMinutes: course.durationMinutes,
      published: course.published,
      sortOrder: course.sortOrder,
    });
    setExpandedCourseId(course.id);
    setMessage("");
  }

  function cancelCourseEdit() {
    setEditingCourseId(null);
    setCourseDraft(emptyCourse(1));
  }

  async function saveCourse() {
    setSavingCourse(true);
    setMessage("");
    try {
      const payload = { ...courseDraft };
      const res = await fetch(
        editingCourseId === "new"
          ? "/api/admin/academy/courses"
          : `/api/admin/academy/courses/${editingCourseId}`,
        {
          method: editingCourseId === "new" ? "POST" : "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save course");
      setMessage(editingCourseId === "new" ? "Course created." : "Course updated.");
      cancelCourseEdit();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save course");
    } finally {
      setSavingCourse(false);
    }
  }

  async function removeCourse(id: string) {
    if (!window.confirm("Delete this course and all its lessons?")) return;
    setMessage("");
    try {
      const res = await fetch(`/api/admin/academy/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to delete course");
      setMessage("Course deleted.");
      if (editingCourseId === id) cancelCourseEdit();
      if (expandedCourseId === id) setExpandedCourseId(null);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete course");
    }
  }

  function startCreateLesson(course: AdminAcademyCourse) {
    setLessonCourseId(course.id);
    setEditingLessonId("new");
    setLessonDraft({
      ...emptyLesson(
        course.lessons.length > 0 ? Math.max(...course.lessons.map((l) => l.sortOrder)) + 1 : 1,
      ),
    });
    setExpandedCourseId(course.id);
    setMessage("");
  }

  function startEditLesson(courseId: string, lesson: AdminAcademyCourse["lessons"][number]) {
    setLessonCourseId(courseId);
    setEditingLessonId(lesson.id);
    setLessonDraft({
      title: lesson.title,
      summary: lesson.summary,
      content: lesson.content,
      durationMinutes: lesson.durationMinutes,
      sortOrder: lesson.sortOrder,
    });
    setMessage("");
  }

  function cancelLessonEdit() {
    setEditingLessonId(null);
    setLessonCourseId(null);
    setLessonDraft(emptyLesson(1));
  }

  async function saveLesson() {
    if (!lessonCourseId) return;
    setSavingLesson(true);
    setMessage("");
    try {
      const res = await fetch(
        editingLessonId === "new"
          ? `/api/admin/academy/courses/${lessonCourseId}/lessons`
          : `/api/admin/academy/lessons/${editingLessonId}`,
        {
          method: editingLessonId === "new" ? "POST" : "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(lessonDraft),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save lesson");
      setMessage(editingLessonId === "new" ? "Lesson added." : "Lesson updated.");
      cancelLessonEdit();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save lesson");
    } finally {
      setSavingLesson(false);
    }
  }

  async function removeLesson(id: string) {
    if (!window.confirm("Delete this lesson?")) return;
    setMessage("");
    try {
      const res = await fetch(`/api/admin/academy/lessons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to delete lesson");
      setMessage("Lesson deleted.");
      if (editingLessonId === id) cancelLessonEdit();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete lesson");
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-[var(--muted)]">Loading academy…</p>
    );
  }

  const sectionSettings = settings ?? DEFAULT_ACADEMY_SECTION;

  return (
    <div className="space-y-8">
      {message ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Academy page copy</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Headline and intro on the public /academy catalog page.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-[var(--foreground)]">Eyebrow</span>
            <input
              value={sectionSettings.eyebrow}
              onChange={(e) => setSettings({ ...sectionSettings, eyebrow: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--foreground)]">Title</span>
            <input
              value={sectionSettings.title}
              onChange={(e) => setSettings({ ...sectionSettings, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-[var(--foreground)]">Tagline</span>
            <input
              value={sectionSettings.tagline}
              onChange={(e) => setSettings({ ...sectionSettings, tagline: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-[var(--foreground)]">Intro</span>
            <textarea
              value={sectionSettings.intro}
              onChange={(e) => setSettings({ ...sectionSettings, intro: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void saveSettings()}
          disabled={savingSettings}
          className="mt-5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {savingSettings ? "Saving…" : "Save page copy"}
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Courses</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Manage courses and lessons. Use markdown-style formatting in lesson content: ## headings,
              **bold**, `code`, lists, blockquotes, and code blocks.
            </p>
          </div>
          <button
            type="button"
            onClick={startCreateCourse}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface)]"
          >
            Add course
          </button>
        </div>

        {editingCourseId ? (
          <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--surface)] p-5 sm:p-6">
            <h3 className="font-semibold text-[var(--foreground)]">
              {editingCourseId === "new" ? "New course" : "Edit course"}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium">Title</span>
                <input
                  value={courseDraft.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setCourseDraft((prev) => ({
                      ...prev,
                      title,
                      slug:
                        editingCourseId === "new" && !prev.slug
                          ? slugifyAcademyTitle(title)
                          : prev.slug,
                    }));
                  }}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium">Slug</span>
                <input
                  value={courseDraft.slug}
                  onChange={(e) => setCourseDraft({ ...courseDraft, slug: e.target.value })}
                  placeholder="publish-your-first-product"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium">Description</span>
                <textarea
                  value={courseDraft.description}
                  onChange={(e) => setCourseDraft({ ...courseDraft, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Level</span>
                <select
                  value={courseDraft.level}
                  onChange={(e) =>
                    setCourseDraft({ ...courseDraft, level: e.target.value as CourseLevel })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                >
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium">Duration (minutes)</span>
                <input
                  type="number"
                  min={5}
                  value={courseDraft.durationMinutes}
                  onChange={(e) =>
                    setCourseDraft({
                      ...courseDraft,
                      durationMinutes: Number.parseInt(e.target.value, 10) || 60,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Sort order</span>
                <input
                  type="number"
                  min={0}
                  value={courseDraft.sortOrder}
                  onChange={(e) =>
                    setCourseDraft({
                      ...courseDraft,
                      sortOrder: Number.parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={courseDraft.published}
                  onChange={(e) => setCourseDraft({ ...courseDraft, published: e.target.checked })}
                />
                <span className="font-medium">Published (visible on /academy)</span>
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void saveCourse()}
                disabled={savingCourse}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingCourse ? "Saving…" : "Save course"}
              </button>
              <button
                type="button"
                onClick={cancelCourseEdit}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {courses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            No courses yet. Add your first course above.
          </p>
        ) : (
          <ul className="space-y-3">
            {courses.map((course) => (
              <li
                key={course.id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {levelBadge(course.level)}
                      {!course.published ? (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                          Draft
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 font-semibold text-[var(--foreground)]">{course.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{course.description}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      /academy/{course.slug} · {course.lessonCount} lessons · ~{course.durationMinutes}{" "}
                      min
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCourseId(expandedCourseId === course.id ? null : course.id)
                      }
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold"
                    >
                      {expandedCourseId === course.id ? "Hide lessons" : "Lessons"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditCourse(course)}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/academy/${course.slug}`}
                      target="_blank"
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold"
                    >
                      Preview
                    </Link>
                    <button
                      type="button"
                      onClick={() => void removeCourse(course.id)}
                      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {expandedCourseId === course.id ? (
                  <div className="border-t border-[var(--border)] bg-[var(--background)]/50 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-[var(--foreground)]">
                        Lessons ({course.lessons.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => startCreateLesson(course)}
                        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold"
                      >
                        Add lesson
                      </button>
                    </div>

                    {editingLessonId && lessonCourseId === course.id ? (
                      <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--surface)] p-4">
                        <h5 className="font-semibold text-[var(--foreground)]">
                          {editingLessonId === "new" ? "New lesson" : "Edit lesson"}
                        </h5>
                        <div className="mt-3 grid gap-3">
                          <label className="block text-sm">
                            <span className="font-medium">Title</span>
                            <input
                              value={lessonDraft.title}
                              onChange={(e) =>
                                setLessonDraft({ ...lessonDraft, title: e.target.value })
                              }
                              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                            />
                          </label>
                          <label className="block text-sm">
                            <span className="font-medium">Summary (sidebar preview)</span>
                            <textarea
                              value={lessonDraft.summary}
                              onChange={(e) =>
                                setLessonDraft({ ...lessonDraft, summary: e.target.value })
                              }
                              rows={2}
                              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                            />
                          </label>
                          <label className="block text-sm">
                            <span className="font-medium">Content</span>
                            <textarea
                              value={lessonDraft.content}
                              onChange={(e) =>
                                setLessonDraft({ ...lessonDraft, content: e.target.value })
                              }
                              rows={12}
                              placeholder="## Section heading&#10;&#10;Write deep lesson content here. Supports **bold**, `code`, lists, and blockquotes."
                              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm leading-relaxed"
                            />
                          </label>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-sm">
                              <span className="font-medium">Duration (min)</span>
                              <input
                                type="number"
                                min={1}
                                value={lessonDraft.durationMinutes}
                                onChange={(e) =>
                                  setLessonDraft({
                                    ...lessonDraft,
                                    durationMinutes: Number.parseInt(e.target.value, 10) || 10,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                              />
                            </label>
                            <label className="block text-sm">
                              <span className="font-medium">Sort order</span>
                              <input
                                type="number"
                                min={0}
                                value={lessonDraft.sortOrder}
                                onChange={(e) =>
                                  setLessonDraft({
                                    ...lessonDraft,
                                    sortOrder: Number.parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                              />
                            </label>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void saveLesson()}
                            disabled={savingLesson}
                            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {savingLesson ? "Saving…" : "Save lesson"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelLessonEdit}
                            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {course.lessons.length === 0 ? (
                      <p className="mt-3 text-sm text-[var(--muted)]">No lessons yet.</p>
                    ) : (
                      <ol className="mt-3 space-y-2">
                        {course.lessons.map((lesson, i) => (
                          <li
                            key={lesson.id}
                            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                Lesson {i + 1}
                              </p>
                              <p className="mt-0.5 font-medium text-[var(--foreground)]">
                                {lesson.title}
                              </p>
                              {lesson.summary ? (
                                <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                                  {lesson.summary}
                                </p>
                              ) : null}
                              <p className="mt-1 text-xs text-[var(--muted)]">
                                ~{lesson.durationMinutes} min · {lesson.content.length.toLocaleString()}{" "}
                                chars
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditLesson(course.id, lesson)}
                                className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void removeLesson(lesson.id)}
                                className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
