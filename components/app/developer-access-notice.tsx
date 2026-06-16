import Link from "next/link";

export function DeveloperAccessNotice() {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
      <p className="text-sm font-semibold text-[var(--foreground)]">Deploy requires the Developer role</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
        Member accounts can browse the marketplace and use this library, but only{" "}
        <span className="font-medium text-[var(--foreground)]">Developers</span> (or admins) can upload and host
        builds. Contact an admin to be promoted, then the Deploy and upload actions unlock.
      </p>
      <p className="mt-3 text-sm text-[var(--muted)]">
        See the{" "}
        <Link href="/deploy" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
          Deploy
        </Link>{" "}
        page for details.
      </p>
    </div>
  );
}
