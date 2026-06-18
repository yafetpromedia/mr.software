"use client";

export type PanelSide = "left" | "center" | "right";
export type PanelVisibility = "expanded" | "minimized" | "closed";

function MinimizeIcon({ side }: { side: PanelSide }) {
  const bar =
    side === "left" ? (
      <rect x="5" y="7" width="5" height="10" rx="1" fill="currentColor" />
    ) : side === "right" ? (
      <rect x="14" y="7" width="5" height="10" rx="1" fill="currentColor" />
    ) : (
      <rect x="9.5" y="7" width="5" height="10" rx="1" fill="currentColor" />
    );

  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
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
      {bar}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function PanelSectionControls({
  side,
  onMinimize,
  onClose,
  className = "",
}: {
  side: PanelSide;
  onMinimize: () => void;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <button
        type="button"
        onClick={onMinimize}
        className="rounded-md p-1.5 text-[var(--muted)] transition hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
        aria-label={`Minimize ${side} panel`}
        title="Minimize"
      >
        <MinimizeIcon side={side} />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1.5 text-[var(--muted)] transition hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
        aria-label={`Close ${side} panel`}
        title="Close"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export function PanelRestoreTab({
  side,
  label,
  onClick,
}: {
  side: PanelSide;
  label: string;
  onClick: () => void;
}) {
  const position =
    side === "left"
      ? "left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-lg border-l-0"
      : side === "right"
        ? "right-0 top-1/2 z-20 -translate-y-1/2 rounded-l-lg border-r-0"
        : "bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed hidden border border-[var(--border)] bg-[var(--surface)] px-2 py-3 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)] shadow-md transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)] lg:flex ${position}`}
      aria-label={`Open ${label}`}
    >
      {side === "center" ? label : (
        <span className={side === "left" || side === "right" ? "[writing-mode:vertical-rl]" : ""}>{label}</span>
      )}
    </button>
  );
}
