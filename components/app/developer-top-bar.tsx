"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHydrated } from "@/hooks/use-hydrated";

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
      <button
        type="button"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
        aria-label="Notifications"
        title="No notifications yet"
        disabled
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        <span className="sr-only">No new notifications</span>
      </button>
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
      <button
        type="button"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--foreground)]"
        aria-label="Notifications"
        title="No notifications yet"
        disabled
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        <span className="sr-only">No new notifications</span>
      </button>
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
