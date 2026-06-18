"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { DeveloperTopBar } from "@/components/app/developer-top-bar";
import { PortalTopBar } from "@/components/app/portal-top-bar";
import { AiPanel } from "@/components/ui/ai-panel";
import {
  PanelRestoreTab,
  PanelSectionControls,
} from "@/components/ui/panel-section-controls";
import { SidebarToggleButton } from "@/components/ui/sidebar-toggle-button";
import { isLibrarySurface } from "@/lib/auth/workspace-surface";
import {
  DEFAULT_WORKSPACE_PANELS,
  loadWorkspacePanels,
  saveWorkspacePanels,
  type WorkspacePanelSide,
  type WorkspacePanelState,
} from "@/lib/workspace-panels";
import { usePathname } from "next/navigation";
import { useState, useEffect, Suspense, type ComponentType, type ReactNode, type SVGProps } from "react";

type NavItem = { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

function IconOverview({ className }: { className?: string }) {
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

function IconDeploy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 4.5v12.75A2.25 2.25 0 0 0 4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V8.25a2.25 2.25 0 0 0-2.25-2.25H9.12a1.5 1.5 0 0 0-1.06.44Z"
      />
    </svg>
  );
}

function IconCurrency({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.878 1.172-2.303 0-3.182C13.535 12.9 12 12 9.999 12c-1.021 0-1.875.291-2.5.75M12 6V3.25a.75.75 0 0 1 1.5 0V6M20.25 12a8.25 8.25 0 0 0-1.2-3.4m0 0a2.5 2.5 0 0 0-1.2-.8m-12.9 0a2.5 2.5 0 0 0-1.2.8m0 0A8.25 8.25 0 0 0 3.75 12"
      />
    </svg>
  );
}

function IconListings({ className }: { className?: string }) {
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

function IconPayouts({ className }: { className?: string }) {
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

function IconLibrary({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
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

function IconStoreBrowse({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 0 0-.75-.75H3a.75.75 0 0 0-.75.75V21m0 0h18M2.25 10.5V4.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25M2.25 10.5h18"
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function IconStorefront({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 0 0-.75-.75h-9A.75.75 0 0 0 3 13.5V21m0 0h18M2.25 10.5V4.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25M2.25 10.5h18M9 6.75h6.75M9 3.75h6.75"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h6" />
    </svg>
  );
}

const studioNav: NavItem[] = [
  { href: "/app/ai", label: "Mr.Software AI", icon: IconSpark },
  { href: "/app", label: "Command center", icon: IconOverview },
  { href: "/app/storefront", label: "Storefront", icon: IconStorefront },
  { href: "/deploy", label: "Deploy", icon: IconDeploy },
  { href: "/projects", label: "Projects", icon: IconFolder },
  { href: "/earnings", label: "Revenue", icon: IconCurrency },
  { href: "/listings", label: "My listings", icon: IconListings },
  { href: "/payouts", label: "Billing", icon: IconPayouts },
  { href: "/settings", label: "Settings", icon: IconCog },
];

const libraryNav: NavItem[] = [
  { href: "/app/home", label: "My library", icon: IconLibrary },
  { href: "/app/my-software", label: "My software", icon: IconPackage },
  { href: "/app/marketplace", label: "Discover", icon: IconStoreBrowse },
  { href: "/app/billing", label: "Purchases", icon: IconCard },
];

function navActive(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === "/app" || pathname === "/app/";
  }
  if (href === "/app/home") {
    return pathname === "/app/home" || pathname === "/app/home/";
  }
  if (href === "/app/ai") {
    return pathname === "/app/ai" || pathname.startsWith("/app/ai/");
  }
  if (href === "/app/storefront") {
    return pathname === "/app/storefront" || pathname.startsWith("/app/storefront/");
  }
  if (href === "/admin") {
    return pathname.startsWith("/admin");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  children: ReactNode;
  userName: string;
  userEmail: string;
  role: string;
};

export function DeveloperWorkspaceShell({ children, userName, userEmail, role }: Props) {
  const pathname = usePathname() ?? "/";
  const libraryMode = isLibrarySurface(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [panels, setPanels] = useState<WorkspacePanelState>(DEFAULT_WORKSPACE_PANELS);
  const [panelsReady, setPanelsReady] = useState(false);
  const showAdmin = role === "ADMIN";

  useEffect(() => {
    setPanels(loadWorkspacePanels());
    setPanelsReady(true);
  }, []);

  useEffect(() => {
    if (!panelsReady) return;
    saveWorkspacePanels(panels);
  }, [panels, panelsReady]);

  function setPanel(side: WorkspacePanelSide, state: WorkspacePanelState[WorkspacePanelSide]) {
    setPanels((current) => ({ ...current, [side]: state }));
  }

  function minimizePanel(side: WorkspacePanelSide) {
    setPanel(side, "minimized");
  }

  function closePanel(side: WorkspacePanelSide) {
    setPanel(side, "closed");
  }

  function expandPanel(side: WorkspacePanelSide) {
    setPanel(side, "expanded");
  }

  function toggleSidebarDesktop() {
    if (panels.left === "expanded") {
      closePanel("left");
    } else {
      expandPanel("left");
    }
  }

  const sidebarMinimized = panels.left === "minimized";
  const sidebarClosedDesktop = panels.left === "closed";
  const sidebarExpandedDesktop = panels.left === "expanded";

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

  const roleLabel = role === "ADMIN" ? "Admin" : "Developer";

  function linkClass(href: string) {
    const active = navActive(pathname, href);
    const base = sidebarMinimized ? "justify-center px-2" : "px-3";
    return `group flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition ${base} ${
      active
        ? "bg-[var(--accent-muted)] text-[var(--foreground)]"
        : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
    }`;
  }

  const sidebarWidthClass = sidebarMinimized
    ? "lg:w-14"
    : "w-[min(17rem,100vw-3rem)]";

  return (
    <div className="relative flex h-dvh overflow-hidden bg-[var(--background)]">
      {panels.right === "closed" ? (
        <PanelRestoreTab side="right" label="AI" onClick={() => expandPanel("right")} />
      ) : null}
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-[2px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex ${sidebarWidthClass} shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--surface)] transition-[width,transform] duration-200 ease-out lg:static lg:h-full lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarClosedDesktop ? "lg:hidden" : ""}`}
        aria-label="Developer"
      >
          <div className={`shrink-0 px-2 pb-2 pt-2 ${sidebarMinimized ? "lg:px-1" : ""}`}>
            <div className="flex items-start justify-between gap-1">
              <Link
                href="/app"
                className={`flex items-center rounded-xl py-1.5 text-sm font-semibold tracking-tight text-[var(--foreground)] ${
                  sidebarMinimized ? "lg:justify-center lg:px-1 lg:py-2" : "gap-2.5 px-2"
                }`}
                title="Mr.Software"
                onClick={
                  sidebarMinimized
                    ? (event) => {
                        event.preventDefault();
                        expandPanel("left");
                      }
                    : undefined
                }
              >
                <LogoMark size="sm" rounded="lg" />
                <span className={sidebarMinimized ? "lg:sr-only" : ""}>Mr.Software</span>
              </Link>
              <PanelSectionControls
                side="left"
                onMinimize={() => minimizePanel("left")}
                onClose={() => closePanel("left")}
                className={`hidden shrink-0 lg:flex ${sidebarMinimized ? "lg:hidden" : ""}`}
              />
            </div>
            <p className={`px-2 pt-1 text-xs text-[var(--muted)] ${sidebarMinimized ? "lg:sr-only" : ""}`}>
              One account · build, buy &amp; sell
            </p>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2" aria-label="Developer">
            <p
              className={`px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] ${
                sidebarMinimized ? "lg:sr-only" : ""
              }`}
            >
              Studio
            </p>
            {studioNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.href)}
                  aria-current={navActive(pathname, item.href) ? "page" : undefined}
                  title={item.label}
                >
                  <Icon className="h-5 w-5 shrink-0 opacity-80" />
                  <span className={`flex-1 text-left ${sidebarMinimized ? "lg:sr-only" : ""}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div
            className={`mt-auto shrink-0 space-y-1 border-t border-[var(--border)] px-2 py-3 ${
              sidebarMinimized ? "lg:px-1" : ""
            }`}
          >
            <p
              className={`px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] ${
                sidebarMinimized ? "lg:sr-only" : ""
              }`}
            >
              Library
            </p>
            {libraryNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.href)}
                  aria-current={navActive(pathname, item.href) ? "page" : undefined}
                  title={item.label}
                >
                  <Icon className="h-5 w-5 shrink-0 opacity-80" />
                  <span className={sidebarMinimized ? "lg:sr-only" : ""}>{item.label}</span>
                </Link>
              );
            })}
            {showAdmin ? (
              <Link
                href="/admin"
                className={`${linkClass("/admin")} mt-2`}
                aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                title="Admin portal"
              >
                <IconShield className="h-5 w-5 shrink-0 opacity-80" />
                <span className={sidebarMinimized ? "lg:sr-only" : ""}>Admin portal</span>
              </Link>
            ) : null}
          </div>

          <div className={`shrink-0 border-t border-[var(--border)] p-3 ${sidebarMinimized ? "lg:p-2" : ""}`}>
            <div
              className={`flex items-center justify-between gap-2 rounded-xl bg-[var(--background)] ${
                sidebarMinimized ? "lg:justify-center lg:px-1 lg:py-2" : "px-2 py-2"
              }`}
            >
              <div className={`min-w-0 ${sidebarMinimized ? "lg:sr-only" : ""}`}>
                <p className="truncate text-xs font-medium text-[var(--foreground)]">{userName}</p>
                <p className="text-[10px] text-[var(--muted)]">{roleLabel}</p>
              </div>
              <span
                className={`hidden h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white ${
                  sidebarMinimized ? "lg:flex" : ""
                }`}
                title={userName}
              >
                {initials}
              </span>
            </div>
          </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--background)]/90 px-2 backdrop-blur-md sm:gap-3 sm:px-4 lg:px-6">
          <SidebarToggleButton
            expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
            mobile
          />
          <SidebarToggleButton
            expanded={sidebarExpandedDesktop}
            onClick={toggleSidebarDesktop}
          />
          <Suspense fallback={<div className="min-w-0 flex-1" aria-hidden />}>
            {libraryMode ? <PortalTopBar /> : <DeveloperTopBar />}
          </Suspense>
          <div className="relative shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 pl-1 pr-2 text-left text-sm shadow-sm"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                {initials}
              </span>
              <span className="hidden max-w-[6rem] truncate text-xs font-medium sm:inline md:max-w-[9rem]">
                {userName}
              </span>
            </button>
            {menuOpen ? (
              <>
                <button type="button" className="fixed inset-0 z-40" aria-label="Close" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl">
                  <p className="border-b border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">{userEmail}</p>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 text-sm hover:bg-[var(--accent-muted)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    href="/app/home"
                    className="block px-3 py-2 text-sm hover:bg-[var(--accent-muted)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    My library
                  </Link>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-red-600"
                    onClick={() => void logout()}
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </header>

        <main className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
          </div>
          {panels.right !== "closed" ? (
            <div className="hidden h-full xl:block">
              <AiPanel
                minimized={panels.right === "minimized"}
                onMinimize={() => minimizePanel("right")}
                onClose={() => closePanel("right")}
                onRestore={() => expandPanel("right")}
              />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
