"use client";

import { useState } from "react";
import { CommandInput } from "@/components/ui/command-input";

const SUGGESTIONS = [
  "Generate a SaaS landing page",
  "Draft startup positioning",
  "Plan deployment pipeline",
  "Create marketplace listing",
] as const;

export function AiPanel({ onClose }: { onClose?: () => void }) {
  const [input, setInput] = useState("");

  return (
    <aside
      className="flex w-80 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--surface)]"
      aria-label="Mr.Software AI Copilot"
    >
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Copilot
          </p>
          <p className="text-sm font-medium text-[var(--foreground)]">Mr.Software AI</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--accent-muted)]"
            aria-label="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
          <p className="text-sm font-medium text-[var(--foreground)]">Startup command center</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            Generate, deploy, and analyze from one intelligent panel. Infrastructure-ready for
            agent integrations.
          </p>
        </div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Workflows
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
        <CommandInput
          value={input}
          onChange={setInput}
          placeholder="Ask AI to build…"
          onSubmit={() => undefined}
        />
      </div>
    </aside>
  );
}
