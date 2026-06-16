import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  className?: string;
};

export function DataGrid<T>({ columns, rows, rowKey, empty, className = "" }: Props<T>) {
  if (rows.length === 0 && empty) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      <div
        className="grid border-b border-[var(--border)] bg-[var(--background)]/50 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((col) => (
          <div key={col.key} className={`px-4 py-2.5 ${col.className ?? ""}`}>
            {col.header}
          </div>
        ))}
      </div>
      <ul>
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className="grid border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--accent-muted)]/30"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((col) => (
              <div key={col.key} className={`px-4 py-3 text-sm ${col.className ?? ""}`}>
                {col.cell(row)}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
