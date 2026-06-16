"use client";

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
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
      <span className="pl-2 text-xs font-mono text-[var(--accent)]" aria-hidden>
        ›
      </span>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) onSubmit();
        }}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
      />
      <button
        type="button"
        disabled={disabled || !value.trim()}
        onClick={onSubmit}
        className="shrink-0 rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-xs font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Run
      </button>
    </div>
  );
}
