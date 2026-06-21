"use client";

import Link from "next/link";
import { useAuthMe } from "@/components/auth/use-auth-me";

export function AuthNav() {
  const me = useAuthMe();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  }

  if (me === undefined) {
    return (
      <span
        className="inline-block h-8 w-20 animate-pulse rounded-lg bg-[var(--accent-muted)]"
        aria-hidden
      />
    );
  }

  if (!me) {
    return (
      <>
        <Link
          href="/auth/login"
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
        >
          Log in
        </Link>
        <Link
          href="/auth/register"
          className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[var(--accent-glow)] transition hover:bg-[var(--accent-hover)]"
        >
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <span className="hidden max-w-[10rem] truncate text-xs text-[var(--muted)] sm:inline md:max-w-[14rem]">
        {me.name}
        {me.status && me.status !== "ACTIVE" ? (
          <span className="ml-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[0.65rem] font-medium text-amber-700 dark:text-amber-400">
            {me.status}
          </span>
        ) : null}
      </span>
      <button
        type="button"
        onClick={() => void logout()}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-muted)]"
      >
        Log out
      </button>
    </>
  );
}
