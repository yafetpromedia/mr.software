import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { BRAND_NAME } from "@/lib/branding/constants";

const DEFAULT_HIGHLIGHTS = [
  "Secure JWT sessions · HTTP-only cookies",
  "Role-ready accounts (USER · DEVELOPER · ADMIN)",
  "Same stack as catalog, workspace, and admin",
] as const;

type Props = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  highlights?: readonly string[];
  footerHref?: string;
  footerLabel?: string;
};

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

export function AuthSplitLayout({
  eyebrow,
  title,
  description,
  children,
  highlights = DEFAULT_HIGHLIGHTS,
  footerHref = "/marketplace",
  footerLabel = "Browse catalog",
}: Props) {
  const footerLinks = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to website
      </Link>
      <Link
        href={footerHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] transition hover:gap-2"
      >
        {footerLabel}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-14">
      <div className="relative grid min-h-[calc(100vh-3.5rem)] gap-8 lg:grid-cols-12 lg:gap-14">
      <div
        className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(ellipse_80%_70%_at_20%_40%,black_20%,transparent_75%)]"
        aria-hidden
      />

      <div className="relative hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-center">
        <div className="relative max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[var(--foreground)] transition hover:opacity-80"
          >
            <LogoMark size="md" rounded="xl" />
            <span className="font-display text-base font-semibold tracking-tight">{BRAND_NAME}</span>
          </Link>

          <p className="mt-8 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            {eyebrow}
          </p>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--foreground)] xl:text-[2.35rem]">
            {title}
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">{description}</p>

          <ul className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 divide-y divide-[var(--border)] backdrop-blur-sm">
            {highlights.map((line) => (
              <li key={line} className="flex items-start gap-3 px-4 py-3 text-sm text-[var(--muted)]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent)]">
                  <CheckIcon />
                </span>
                <span className="leading-snug">{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">{footerLinks}</div>
        </div>
      </div>

      <div className="flex flex-col justify-center lg:col-span-7">
        <div className="relative mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <div className="p-7 sm:p-9">
              <div className="mb-7 flex items-center justify-between lg:hidden">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]"
                >
                  <LogoMark size="md" rounded="xl" />
                  {BRAND_NAME}
                </Link>
              </div>
              {children}
            </div>
          </div>
          <div className="mt-5 lg:hidden">{footerLinks}</div>
        </div>
      </div>
    </div>
    </div>
  );
}
