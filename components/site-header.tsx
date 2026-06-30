"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LogoMark } from "@/components/brand/logo-mark";
import { AuthNav } from "@/components/auth-nav";
import { useAuthMe, workspaceHrefFor } from "@/components/auth/use-auth-me";
import { PUBLIC_SITE_NAV, signedInSiteNav } from "@/components/site-nav-links";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BRAND_NAME } from "@/lib/branding/constants";

export function SiteHeader() {
  const me = useAuthMe();
  const [elevated, setElevated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  const nav = useMemo(() => {
    if (me === undefined) return PUBLIC_SITE_NAV;
    if (!me) return PUBLIC_SITE_NAV;
    return signedInSiteNav(me);
  }, [me]);

  const homeHref = me ? workspaceHrefFor(me) : "/";
  const mobileCta = me
    ? { href: workspaceHrefFor(me), label: "Open workspace" }
    : { href: "/marketplace", label: "Explore marketplace" };

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 border-b transition-[box-shadow,background-color,border-color] duration-300 ${
        elevated || menuOpen
          ? "border-[var(--border)] bg-[var(--surface)]/95 shadow-[var(--shadow-card)] backdrop-blur-xl"
          : "border-transparent bg-[var(--background)]/85 backdrop-blur-lg"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6">
        <Link
          href={homeHref}
          className="flex min-w-0 shrink items-center gap-2 font-display text-sm font-semibold tracking-tight text-[var(--foreground)]"
          onClick={() => setMenuOpen(false)}
        >
          <LogoMark size="sm" priority rounded="lg" />
          <span className="truncate">{BRAND_NAME}</span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Main navigation"
        >
          {nav.map((item) => (
            <HeaderLink key={item.href} href={item.href}>
              {item.label}
            </HeaderLink>
          ))}
          <ThemeToggle className="mx-1" />
          <AuthNav />
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-nav"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[var(--border)] bg-[var(--surface)] lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile navigation">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--accent-muted)]"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={mobileCta.href}
                className="btn-brand mt-2 flex h-11 items-center justify-center rounded-lg text-sm font-semibold"
                onClick={() => setMenuOpen(false)}
              >
                {mobileCta.label}
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
                <AuthNav />
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)] xl:px-3"
    >
      <span className="relative">
        {children}
        <span
          className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"
          aria-hidden
        />
      </span>
    </Link>
  );
}
