import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { BRAND_AI_NAME, BRAND_NAME } from "@/lib/branding/constants";

const product = [
  { href: "/marketplace", label: "Explore marketplace" },
  { href: "/app/ai", label: BRAND_AI_NAME },
  { href: "/app/ai/blueprint", label: "SaaS Blueprint" },
  { href: "/#features", label: "Features" },
  { href: "/app", label: "Workspace" },
] as const;

const explore = [
  { href: "/#partners", label: "Partners" },
  { href: "/#team", label: "Team" },
  { href: "/listings", label: "Sell on marketplace" },
] as const;

const developers = [
  { href: "/app", label: "Workspace" },
  { href: "/deploy", label: "Deploy" },
  { href: "/projects", label: "Projects" },
  { href: "/listings", label: "Listings" },
] as const;

const company = [
  { href: "/report", label: "Report a problem" },
  { href: "/auth/login", label: "Log in" },
  { href: "/auth/register", label: "Register" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface-elevated)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--foreground)]"
            >
              <LogoMark size="md" rounded="xl" />
              {BRAND_NAME}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              AI helps you design, build, and launch startups — with full control over code,
              hosting, and monetization. An open ecosystem for builders, not a closed AI tool.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5">
              {product.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--foreground)]/90 transition hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--foreground)]/90 transition hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Developers
            </h3>
            <ul className="mt-4 space-y-2.5">
              {developers.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--foreground)]/90 transition hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Account
            </h3>
            <ul className="mt-4 space-y-2.5">
              {company.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--foreground)]/90 transition hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--muted)]">© {year} {BRAND_NAME}. All rights reserved.</p>
          <p className="text-xs text-[var(--muted)]">
            Created by{" "}
            <span className="font-semibold text-[var(--foreground)]">
              YafetPromedia
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
