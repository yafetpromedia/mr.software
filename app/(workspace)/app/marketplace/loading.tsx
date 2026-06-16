export default function AppMarketplaceLoading() {
  return (
    <div className="animate-pulse space-y-4 py-6">
      <div className="h-24 rounded-2xl bg-[var(--surface)]" />
      <div className="h-8 max-w-sm rounded-lg bg-[var(--surface)]" />
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="h-64 rounded-2xl bg-[var(--surface)]" />
        ))}
      </ul>
    </div>
  );
}
