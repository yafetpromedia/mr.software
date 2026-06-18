export default function AppWorkspaceLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-[var(--surface-muted)]/50" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/30" />
    </div>
  );
}
