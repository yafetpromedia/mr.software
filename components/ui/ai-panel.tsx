"use client";

import { useState } from "react";
import { CommandInput } from "@/components/ui/command-input";
import { PanelSectionControls } from "@/components/ui/panel-section-controls";

const SUGGESTIONS = [
  "Generate a SaaS landing page",
  "Draft startup positioning",
  "Plan deployment pipeline",
  "Create marketplace listing",
] as const;

type Props = {
  minimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  onRestore?: () => void;
};

export function AiPanel({ minimized = false, onMinimize, onClose, onRestore }: Props) {
  const [input, setInput] = useState("");

  if (minimized) {
    return (
      <aside
        className="flex w-10 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--surface)]"
        aria-label="Mr.Software AI Copilot"
      >
        <button
          type="button"
          onClick={onRestore}
          className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-[var(--muted)] transition hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
          aria-label="Expand AI panel"
          title="Expand AI panel"
        >
          <span className="text-sm text-[var(--accent)]" aria-hidden>
            ✦
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider [writing-mode:vertical-rl]">
            AI
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="flex h-full w-80 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--surface)]"
      aria-label="Mr.Software AI Copilot"
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Copilot
          </p>
          <p className="truncate text-sm font-medium text-[var(--foreground)]">Mr.Software AI</p>
        </div>
        {onMinimize || onClose ? (
          <PanelSectionControls side="right" onMinimize={onMinimize ?? (() => undefined)} onClose={onClose ?? (() => undefined)} />
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
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

      <div className="shrink-0 border-t border-[var(--border)] p-3">
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
