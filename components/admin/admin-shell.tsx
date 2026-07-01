"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { SidebarToggleButton } from "@/components/ui/sidebar-toggle-button";
import {
  loadSidebarVisibility,
  saveSidebarVisibility,
  SIDEBAR_STORAGE_KEYS,
  type SidebarVisibility,
} from "@/lib/sidebar-state";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/users": "Users",
  "/admin/developer-requests": "Developer requests",
  "/admin/software": "Software",
  "/admin/deployments": "Deployments",
  "/admin/payments": "Payments",
  "/admin/coupons": "Coupons",
  "/admin/reports": "Reports",
  "/admin/moderation": "Moderation",
  "/admin/system": "System",
  "/admin/site": "Site",
  "/admin/team": "Team",
  "/admin/academy": "Academy",
  "/admin/testimonials": "Testimonials",
  "/admin/storefronts": "Storefronts",
  "/admin/audit": "Audit log",
  "/admin/settings": "Settings",
};

function pageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.entries(PAGE_TITLES)
    .filter(([path]) => path !== "/admin")
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(`${path}/`));
  return match?.[1] ?? "Admin";
}

const nav: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.813-2.513M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    href: "/admin/developer-requests",
    label: "Dev requests",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    href: "/admin/software",
    label: "Software",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
  },
  {
    href: "/admin/deployments",
    label: "Deployments",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ),
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
      </svg>
    ),
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
  },
  {
    href: "/admin/moderation",
    label: "Moderation",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.825 10.29 9 11.623 5.175-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    href: "/admin/system",
    label: "System",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.375.313.69.645.87.334.18.72.2 1.07.05l1.15-.45c.51-.2 1.08-.12 1.5.2l1.8 1.8c.32.32.4.99.2 1.5l-.45 1.15c-.15.35-.13.74.05 1.07.18.33.5.57.86.64l1.28.21c.54.1.94.59.94 1.14v2.59c0 .55-.4 1.04-.94 1.14l-1.28.21c-.36.07-.68.31-.86.64-.18.33-.2.72-.05 1.07l.45 1.15c.2.51.12 1.08-.2 1.5l-1.8 1.8c-.32.32-.99.4-1.5.2l-1.15-.45a1.1 1.1 0 0 0-1.07.05c-.32.18-.57.5-.64.86l-.21 1.28c-.09.54-.56.94-1.11.94h-2.59c-.55 0-1.04-.4-1.14-.94l-.21-1.28c-.07-.36-.32-.68-.64-.86a1.1 1.1 0 0 0-1.07-.05l-1.15.45c-.51.2-1.08.12-1.5-.2l-1.8-1.8a1.14 1.14 0 0 0-.2-1.5l.45-1.15c.15-.35.13-.74-.05-1.07-.18-.33-.5-.57-.86-.64l-1.28-.21a1.08 1.08 0 0 1-1.11-1.12v-2.59c0-.55.4-1.04.94-1.14l1.28-.21c.36-.07.68-.32.86-.64.18-.33.2-.72.05-1.07l-.45-1.15a1.14 1.14 0 0 0 .2-1.5l1.8-1.8c.32-.32.99-.4 1.5-.2l1.15.45c.35.15.75.14 1.07-.05.32-.18.57-.5.64-.86l.21-1.28ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
  {
    href: "/admin/site",
    label: "Site",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125V6.75ZM6 15h4.5m-4.5-3h8.25"
        />
      </svg>
    ),
  },
  {
    href: "/admin/team",
    label: "Team",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
  },
  {
    href: "/admin/academy",
    label: "Academy",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
        />
      </svg>
    ),
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
  },
  {
    href: "/admin/storefronts",
    label: "Storefronts",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
        />
      </svg>
    ),
  },
  {
    href: "/admin/audit",
    label: "Audit log",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125V7.125a3.375 3.375 0 0 0-3.375-3.375H5.25a.75.75 0 0 0-.75.75V21a.75.75 0 0 0 .75.75H18a.75.75 0 0 0 .75-.75V14.25Z" />
      </svg>
    ),
  },
];

function navActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  children: ReactNode;
  userName: string;
  userEmail: string;
};

function AccountMenu({
  userName,
  userEmail,
  initials,
  onLogout,
  align = "right",
}: {
  userName: string;
  userEmail: string;
  initials: string;
  onLogout: () => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1 pl-1 pr-2.5 text-left transition hover:border-[var(--accent)]/30 sm:pr-3"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[7rem] truncate text-sm font-medium text-[var(--foreground)] sm:block">
          {userName}
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-[var(--muted)] sm:block" aria-hidden />
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            className={`absolute top-full z-50 mt-2 w-60 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <div className="border-b border-[var(--border)] px-3 py-2.5">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">{userName}</p>
              <p className="truncate text-xs text-[var(--muted)]">{userEmail}</p>
            </div>
            <Link
              href="/admin/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--accent-muted)]"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4 text-[var(--muted)]" aria-hidden />
              Profile settings
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-500/8"
              onClick={() => void onLogout()}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function AdminShell({ children, userName, userEmail }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebar, setSidebar] = useState<SidebarVisibility>("expanded");
  const [sidebarReady, setSidebarReady] = useState(false);
  const title = pageTitle(pathname);

  useEffect(() => {
    setSidebar(loadSidebarVisibility(SIDEBAR_STORAGE_KEYS.admin));
    setSidebarReady(true);
  }, []);

  useEffect(() => {
    if (!sidebarReady) return;
    saveSidebarVisibility(SIDEBAR_STORAGE_KEYS.admin, sidebar);
  }, [sidebar, sidebarReady]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarExpanded = sidebar === "expanded";

  function toggleSidebarDesktop() {
    setSidebar((current) => (current === "expanded" ? "closed" : "expanded"));
  }

  function toggleSidebarMobile() {
    setMobileOpen((open) => !open);
  }

  const initials = userName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[var(--background)]">
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-transform duration-300 ease-out dark:bg-[var(--surface-elevated)] lg:static lg:z-0 lg:h-full lg:w-64 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${!sidebarExpanded ? "lg:hidden" : ""}`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] px-4 lg:h-16">
          <LogoMark size="md" rounded="xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">Operations</p>
            <p className="truncate text-xs text-[var(--muted)]">Mr.Software admin</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)] lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
          {nav.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--accent-muted)]/60 hover:text-[var(--foreground)]"
                }`}
              >
                <span className={active ? "text-[var(--accent)]" : "text-[var(--muted)]"}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Back to site
          </Link>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--background)]/90 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--background)]/75 sm:gap-4 sm:px-5 lg:h-16 lg:px-6">
          <SidebarToggleButton
            expanded={mobileOpen}
            onClick={toggleSidebarMobile}
            mobile
          />
          <SidebarToggleButton
            expanded={sidebarExpanded}
            onClick={toggleSidebarDesktop}
          />

          <div className="hidden min-w-0 shrink-0 sm:block lg:w-36">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Admin</p>
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">{title}</p>
          </div>

          <AdminTopBar />

          <AccountMenu
            userName={userName}
            userEmail={userEmail}
            initials={initials}
            onLogout={logout}
            align="right"
          />
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
