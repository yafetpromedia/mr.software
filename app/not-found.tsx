import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        404
      </p>
      <h1 className="mt-3 text-lg font-semibold text-[var(--foreground)]">Page not found</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        The page you requested does not exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
