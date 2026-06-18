export function LandingSectionPlaceholder({ className = "h-48" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`mx-auto w-full max-w-6xl animate-pulse rounded-2xl bg-[var(--surface-muted)]/40 px-4 sm:px-6 ${className}`}
    />
  );
}
