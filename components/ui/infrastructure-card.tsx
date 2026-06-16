import type { ReactNode } from "react";

export function InfrastructureCard({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm ${
        hover
          ? "transition duration-300 hover:border-[var(--accent)]/25 hover:shadow-[0_0_40px_-16px_var(--accent-glow)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
