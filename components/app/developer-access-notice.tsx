import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

export function DeveloperAccessNotice() {
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-[var(--surface)] p-5 sm:p-6">
      <div className="flex gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <Shield className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Deploy requires the Developer role
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
            Member accounts can browse the marketplace and use this library.{" "}
            <span className="font-medium text-[var(--foreground)]">Developers</span> and admins can
            upload and host builds — contact an admin to be promoted.
          </p>
          <Link
            href="/deploy"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Learn about deploy access
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
