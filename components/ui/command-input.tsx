"use client";

import { useEffect, useRef } from "react";

export function CommandInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask AI to build…",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  return (
    <div className="flex min-w-0 items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
      <span className="shrink-0 self-center pl-2 text-xs font-mono text-[var(--accent)]" aria-hidden>
        ›
      </span>
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        className="max-h-[120px] min-h-[2.25rem] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-sm leading-relaxed break-words text-[var(--foreground)] outline-none [overflow-wrap:anywhere] placeholder:text-[var(--muted)]"
      />
      <button
        type="button"
        disabled={disabled || !value.trim()}
        onClick={onSubmit}
        className="shrink-0 self-end rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-xs font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Run
      </button>
    </div>
  );
}
