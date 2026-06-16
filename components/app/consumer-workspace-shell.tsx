"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { PortalTopBar } from "@/components/app/portal-top-bar";
import { usePathname } from "next/navigation";
import { useState, useEffect, Suspense, type ComponentType, type ReactNode, type SVGProps } from "react";

type NavItem = { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function IconStore({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 0 0-.75-.75H3a.75.75 0 0 0-.75.75V21m0 0h18M2.25 10.5V4.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25M2.25 10.5h18M9 3.75h6.75m-6.75 0V6m0-2.25V3.75M9 3.75h.008v.008H9V3.75Zm3 0h.008v.008H12V3.75Zm3 0h.008v.008H15V3.75Z"
      />
    </svg>
  );
}

function IconPackage({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125ZM9.75 3.75h4.5c.621 0 1.125.504 1.125 1.125v.75H8.625v-.75c0-.621.504-1.125 1.125-1.125Z"
      />
    </svg>
  );
}

function IconCard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
      />
    </svg>
  );
}

function IconCog({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.375.313.69.645.87.334.18.72.2 1.07.05l1.15-.45c.51-.2 1.08-.12 1.5.2l1.8 1.8c.32.32.4.99.2 1.5l-.45 1.15c-.15.35-.13.74.05 1.07.18.33.5.57.86.64l1.28.21c.54.1.94.59.94 1.14v2.59c0 .55-.4 1.04-.94 1.14l-1.28.21c-.36.07-.68.31-.86.64-.18.33-.2.72-.05 1.07l.45 1.15c.2.51.12 1.08-.2 1.5l-1.8 1.8c-.32.32-.99.4-1.5.2l-1.15-.45a1.1 1.1 0 0 0-1.07.05c-.32.18-.57.5-.64.86l-.21 1.28c-.09.54-.56.94-1.11.94h-2.59c-.55 0-1.04-.4-1.14-.94l-.21-1.28c-.07-.36-.32-.68-.64-.86a1.1 1.1 0 0 0-1.07-.05l-1.15.45c-.51.2-1.08.12-1.5-.2l-1.8-1.8a1.14 1.14 0 0 0-.2-1.5l.45-1.15c.15-.35.13-.74-.05-1.07-.18-.33-.5-.57-.86-.64l-1.28-.21a1.08 1.08 0 0 1-1.11-1.12v-2.59c0-.55.4-1.04.94-1.14l1.28-.21c.36-.07.68-.32.86-.64.18-.33.2-.72.05-1.07l-.45-1.15a1.14 1.14 0 0 0 .2-1.5l1.8-1.8c.32-.32.99-.4 1.5-.2l1.15.45c.35.15.75.14 1.07-.05.32-.18.57-.5.64-.86l.21-1.28ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.825 10.29 9 11.623 5.175-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
}

function IconSpark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 0 0 1.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  );
}

const libraryNav: NavItem[] = [
  { href: "/app/home", label: "Home", icon: IconHome },
  { href: "/app/marketplace", label: "Marketplace", icon: IconStore },
  { href: "/app/my-software", label: "My software", icon: IconPackage },
  { href: "/app/billing", label: "Billing", icon: IconCard },
  { href: "/app/settings", label: "Settings", icon: IconCog },
];

function navActive(pathname: string, href: string): boolean {
  if (href === "/app/home") {
    return pathname === "/app/home";
  }
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  children: ReactNode;
  userName: string;
  userEmail: string;
  role: string;
};

export function ConsumerWorkspaceShell({ children, userName, userEmail, role }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const showAdmin = role === "ADMIN";
  const showDevShortcut = role === "DEVELOPER" || role === "ADMIN";

  useEffect(() => {
    if (!mobileNavOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  }

  const initials = userName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function linkClass(href: string) {
    const active = navActive(pathname, href);
    return `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      active
        ? "bg-[var(--accent-muted)] text-[var(--foreground)]"
        : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
    }`;
  }

  const roleLabel =
    role === "ADMIN" ? "Admin" : role === "DEVELOPER" ? "Developer" : "Member";

  const navBlock = (items: NavItem[], keyPrefix: string) =>
    items.map((item) => {
      const active = navActive(pathname, item.href);
      const Icon = item.icon;
      return (
        <Link
          key={`${keyPrefix}-${item.href}`}
          href={item.href}
          className={linkClass(item.href)}
          aria-current={active ? "page" : undefined}
        >
          <Icon className="h-5 w-5 shrink-0 opacity-80" />
          <span className="flex-1 text-left">{item.label}</span>
        </Link>
      );
    });

  const navBody = (
    <>
      <div className="px-2 pb-4">
        <Link
          href="/app/home"
          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm font-semibold tracking-tight text-[var(--foreground)]"
        >
          <LogoMark size="sm" rounded="lg" />
          Mr.Software
        </Link>
        <p className="px-2 pt-1 text-xs text-[var(--muted)]">Your software library</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2" aria-label="Account">
        {navBlock(libraryNav, "lib")}
        {showDevShortcut ? (
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Developer
            </p>
            <Link
              href="/app"
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--foreground)]"
            >
              <IconSpark className="h-5 w-5 shrink-0 opacity-80" />
              <span className="flex-1 text-left">Build &amp; earn</span>
            </Link>
          </div>
        ) : null}
        {showAdmin ? (
          <div className="mt-auto border-t border-[var(--border)] pt-3">
            <Link
              href="/admin"
              className={linkClass("/admin")}
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
            >
              <IconShield className="h-5 w-5 shrink-0 opacity-80" />
              <span>Admin</span>
            </Link>
          </div>
        ) : null}
      </nav>

      <div className="mt-auto border-t border-[var(--border)] p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--background)] px-2 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[var(--foreground)]">{userName}</p>
            <p className="text-[10px] text-[var(--muted)]">{roleLabel}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-dvh bg-[var(--background)]">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-[2px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(17rem,100vw-3rem)] flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="App navigation"
      >
        {navBody}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--background)]/90 px-2 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--background)]/75 sm:gap-3 sm:px-4 lg:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--foreground)] transition hover:bg-[var(--surface)] lg:hidden"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          >
            {mobileNavOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
          <Suspense fallback={<div className="min-w-0 flex-1" aria-hidden />}>
            <PortalTopBar />
          </Suspense>
          <div className="relative shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 pl-1 pr-2 text-left text-sm shadow-sm transition hover:border-[var(--accent)]/40"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label="Account menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                {initials}
              </span>
              <span className="hidden max-w-[6rem] truncate text-xs font-medium text-[var(--foreground)] sm:inline md:max-w-[9rem]">
                {userName}
              </span>
            </button>

            {menuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl">
                  <p className="border-b border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
                    {userEmail}
                  </p>
                  <p className="px-3 py-1.5 text-xs text-[var(--muted)]">
                    Role: <span className="font-medium text-[var(--foreground)]">{roleLabel}</span>
                  </p>
                  <Link
                    href="/app/settings"
                    className="block rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent-muted)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    onClick={() => void logout()}
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
