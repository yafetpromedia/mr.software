"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

type Props = {
  redirectTo: string;
  authLocked?: boolean;
  initialOauthError?: string | null;
};

function FieldIconUser() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

function FieldIconMail() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );
}

function FieldIconLock() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}

export function RegisterForm({ redirectTo, authLocked = false, initialOauthError }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    initialOauthError ?? null,
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (authLocked) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Registration failed";
        setError(msg);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  const fieldWrap =
    "relative flex items-center rounded-2xl border border-[var(--border)] bg-[var(--background)] transition focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--ring)]";
  const iconBox =
    "pointer-events-none flex h-12 w-12 shrink-0 items-center justify-center text-[var(--muted)]";
  const inputInner =
    "h-12 min-w-0 flex-1 bg-transparent pr-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]";

  const strength =
    password.length === 0
      ? 0
      : password.length < 8
        ? 1
        : password.length < 12
          ? 2
          : 3;

  return (
    <div className="flex flex-col gap-5">
      {authLocked ? (
        <div
          className="rounded-2xl border border-amber-300/60 bg-amber-500/5 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
          role="status"
        >
          Registration is temporarily disabled while maintenance is in progress.
        </div>
      ) : null}
      <GoogleSignInButton
        redirectTo={redirectTo}
        from="register"
        label="Sign up with Google"
        disabled={authLocked}
      />
      <div className="relative flex items-center gap-4 py-1">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          or with email
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>
      {error ? (
        <div
          className="rounded-2xl border border-red-300/60 bg-red-500/5 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="flex flex-col gap-5"
        aria-disabled={authLocked}
      >
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Name
        </span>
        <div className={fieldWrap}>
          <span className={iconBox}>
            <FieldIconUser />
          </span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Cooper"
            className={inputInner}
            disabled={authLocked}
          />
        </div>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Email
        </span>
        <div className={fieldWrap}>
          <span className={iconBox}>
            <FieldIconMail />
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputInner}
            disabled={authLocked}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          Use a real email you can access. Temporary or disposable addresses are not allowed.
        </p>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Password
        </span>
        <div className={fieldWrap}>
          <span className={iconBox}>
            <FieldIconLock />
          </span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputInner}
            disabled={authLocked}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  strength > i
                    ? strength === 1
                      ? "bg-amber-500/80"
                      : strength === 2
                        ? "bg-[var(--accent)]/80"
                        : "bg-emerald-500/80"
                    : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[var(--muted)]">
            {password.length === 0
              ? "8+ characters"
              : password.length < 8
                ? `${8 - password.length} more`
                : "Looks good"}
          </span>
        </div>
      </label>
      <button
        type="submit"
        disabled={pending || authLocked}
        className="group relative mt-1 inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-[var(--accent)] text-sm font-semibold text-white shadow-lg shadow-[var(--accent-glow)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        <span className="relative z-10 flex items-center gap-2">
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <span
                className="transition group-hover:translate-x-0.5"
                aria-hidden
              >
                →
              </span>
            </>
          )}
        </span>
      </button>
    </form>
    </div>
  );
}
