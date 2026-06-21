"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--foreground)]"
    >
      Print / Save PDF
    </button>
  );
}
