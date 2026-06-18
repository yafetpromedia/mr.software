"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHydrated } from "@/hooks/use-hydrated";
import { NotificationBell } from "@/components/notifications/notification-bell";

function TopBarSearchShell({
  id,
  label,
  placeholder,
}: {
  id: string;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <form
        className="relative min-w-0 max-w-md flex-1"
        role="search"
        aria-label={label}
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="sr-only" htmlFor={id}>
          {label}
        </label>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-hidden>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </span>
        <input
          id={id}
          type="search"
          readOnly
          tabIndex={-1}
          placeholder={placeholder}
          className="h-9 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none"
        />
      </form>
      <NotificationBell />
    </div>
  );
}

function DeveloperTopBarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = pathname.startsWith("/projects") ? (searchParams.get("q") ?? "") : "";
  const [q, setQ] = useState(fromUrl);

  useEffect(() => {
    setQ(fromUrl);
  }, [fromUrl]);

  const submit = useCallback(() => {
    const t = q.trim();
    if (t) {
      router.push(`/projects?q=${encodeURIComponent(t)}`);
    } else {
      router.push("/projects");
    }
  }, [q, router]);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <form
        className="relative min-w-0 max-w-md flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        role="search"
        aria-label="Search projects"
      >
        <label className="sr-only" htmlFor="dev-project-search">
          Search projects
        </label>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-hidden>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </span>
        <input
          id="dev-project-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects…"
          className="h-9 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none ring-[var(--accent)]/25 focus:ring-2"
        />
      </form>
      <NotificationBell />
    </div>
  );
}

export function DeveloperTopBar() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <TopBarSearchShell id="dev-project-search" label="Search projects" placeholder="Search projects…" />
    );
  }
  return (
    <Suspense
      fallback={
        <TopBarSearchShell id="dev-project-search" label="Search projects" placeholder="Search projects…" />
      }
    >
      <DeveloperTopBarContent />
    </Suspense>
  );
}
