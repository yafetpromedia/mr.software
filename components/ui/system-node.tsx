"use client";

import type { ReactNode } from "react";

type Props = {
  label: string;
  sub?: string;
  active?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
};

export function SystemNode({ label, sub, active, onClick, children, className = "" }: Props) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`ecosystem-node rounded-lg border px-3 py-2 text-center transition ${
        active
          ? "border-[var(--accent)]/50 bg-[var(--accent-muted)]"
          : "border-[var(--border)] bg-[var(--surface)]"
      } ${className}`}
    >
      <p className="text-xs font-semibold">{label}</p>
      {sub ? <p className="text-[0.65rem] text-[var(--muted)]">{sub}</p> : null}
      {children}
    </Tag>
  );
}
