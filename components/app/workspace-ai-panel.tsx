"use client";

import { useState } from "react";

const SUGGESTIONS = [
  "Generate a SaaS landing page",
  "Draft startup positioning",
  "Plan deployment pipeline",
  "Create marketplace listing",
] as const;

export function WorkspaceAiPanel() {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] shadow-xl lg:hidden"
      >
        <span aria-hidden>✦</span> AI
      </button>
    );
  }

  return (
    <aside
      className="hidden w-80 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--surface)] dark:bg-[var(--surface-elevated)] lg:flex"
      aria-label="AI assistant"
    >
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Copilot
          </p>
          <p className="text-sm font-medium text-[var(--foreground)]">Mr.Software AI</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--accent-muted)]"
          aria-label="Collapse AI panel"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--foreground)]">Startup command center</p>
          <p className="mt-1 text-xs leading-relaxed">
            AI workflows for generation, deployment insights, and launch orchestration.
          </p>
        </div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Quick actions
        </p>
        <ul className="space-y-1.5">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setInput(s)}
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--foreground)] transition hover:border-[var(--accent)]/30 hover:bg-[var(--accent-muted)]"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <label htmlFor="ai-panel-input" className="sr-only">
          Ask AI
        </label>
        <textarea
          id="ai-panel-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="Describe what you want to build…"
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
        />
        <button
          type="button"
          disabled={!input.trim()}
          className="mt-2 w-full rounded-xl bg-[var(--foreground)] py-2 text-xs font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run workflow (preview)
        </button>
      </div>
    </aside>
  );
}
