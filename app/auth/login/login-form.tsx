"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { postLoginPath } from "@/lib/auth/post-login-redirect";

type Props = {
  redirectTo: string;
  authLocked?: boolean;
  initialOauthError?: string | null;
};

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

export function LoginForm({ redirectTo, authLocked = false, initialOauthError }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    initialOauthError ?? null,
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        user?: { role?: string };
      };
      if (!res.ok) {
        const msg = data.error ?? "Sign-in failed";
        setError(msg);
        return;
      }
      const role = data.user?.role ?? "USER";
      router.push(postLoginPath(role, redirectTo));
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

  return (
    <div className="flex flex-col gap-5">
      {authLocked ? (
        <div
          className="rounded-2xl border border-amber-300/60 bg-amber-500/5 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
          role="status"
        >
          Maintenance mode is on. Only administrator accounts can sign in right now.
        </div>
      ) : null}
      <GoogleSignInButton redirectTo={redirectTo} from="login" />
      <div className="relative flex items-center gap-4 py-1">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          or with email
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>
      {error ? (
        <div
          className="space-y-2 rounded-2xl border border-red-300/60 bg-red-500/5 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          <p>{error}</p>
          {error === "Invalid email or password" ? (
            <p className="text-xs font-normal leading-relaxed text-[var(--muted)] dark:text-red-200/80">
              If you registered with Google, use{" "}
              <strong className="font-medium text-[var(--foreground)]">Continue with Google</strong>{" "}
              above—not email and password. Otherwise create an account or verify your password.
            </p>
          ) : null}
        </div>
      ) : null}
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-5">
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
          />
        </div>
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputInner}
          />
        </div>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="group relative mt-1 inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-[var(--accent)] text-sm font-semibold text-white shadow-lg shadow-[var(--accent-glow)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        <span className="relative z-10 flex items-center gap-2">
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
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
