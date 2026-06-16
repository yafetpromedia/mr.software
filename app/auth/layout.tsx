export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col border-t border-[var(--border)] bg-mesh">
      <div
        className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,black_15%,transparent_65%)]"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
