"use client";

export function SidebarPanelIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect x="5" y="7" width="5" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}

type Props = {
  expanded: boolean;
  onClick: () => void;
  className?: string;
  /** When true, uses mobile nav styling (e.g. no background until hover). */
  mobile?: boolean;
};

export function SidebarToggleButton({ expanded, onClick, className = "", mobile = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        mobile
          ? `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--foreground)] transition hover:bg-[var(--surface)] lg:hidden ${className}`
          : `hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-muted)] lg:inline-flex ${className}`
      }
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={expanded}
      title={expanded ? "Collapse sidebar" : "Expand sidebar"}
    >
      <SidebarPanelIcon className="h-4 w-4" />
    </button>
  );
}
