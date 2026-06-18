"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type AccountSettingsInitial = {
  name: string;
  email: string;
  role: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  memberSince: string;
};

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  autoComplete,
  hint,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-[var(--muted)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
      />
      {hint ? <p className="mt-1 text-[0.65rem] text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

function Status({ message, error }: { message?: string; error?: string }) {
  if (error) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
        {error}
      </p>
    );
  }
  if (message) {
    return <p className="text-sm text-[var(--muted)]">{message}</p>;
  }
  return null;
}

export function AdminAccountSettings({ initial }: { initial: AccountSettingsInitial }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [profileStatus, setProfileStatus] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [hasPassword, setHasPassword] = useState(initial.hasPassword);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [sessionBusy, setSessionBusy] = useState(false);

  const memberSince = new Date(initial.memberSince).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus("");
    setProfileError("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      const data = (await res.json()) as { error?: string; profile?: { name: string; email: string } };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      if (data.profile) {
        setName(data.profile.name);
        setEmail(data.profile.email);
      }
      setProfileStatus("Profile updated.");
      router.refresh();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordStatus("");
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      setPasswordSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to update password");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      const wasNew = !hasPassword;
      setHasPassword(true);
      setPasswordStatus(
        wasNew ? "Password set. You can now sign in with email." : "Password updated.",
      );
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function logout() {
    setSessionBusy(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  }

  async function revokeAllSessions() {
    setSessionBusy(true);
    try {
      await fetch("/api/account/sessions/revoke", { method: "POST", credentials: "include" });
      window.location.href = "/auth/login";
    } finally {
      setSessionBusy(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Profile settings
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Update your admin identity, password, and sessions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent-muted)] px-2.5 py-1 font-semibold text-[var(--accent)]">
            {initial.role}
          </span>
          {initial.hasGoogle ? (
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[var(--muted)]">
              Google linked
            </span>
          ) : null}
          <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[var(--muted)]">
            Since {memberSince}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={(e) => void saveProfile(e)}
        className="flex h-full flex-col space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
      >
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Profile</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Name and email shown across admin and product.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Display name" id="profile-name" value={name} onChange={setName} autoComplete="name" />
          <Field
            label="Email"
            id="profile-email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
        </div>
        <Status message={profileStatus} error={profileError} />
        <button
          type="submit"
          disabled={profileSaving}
          className="inline-flex h-9 items-center rounded-lg bg-[var(--foreground)] px-4 text-sm font-medium text-[var(--background)] disabled:opacity-50"
        >
          {profileSaving ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form
        onSubmit={(e) => void savePassword(e)}
        className="flex h-full flex-col space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
      >
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Password</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {initial.hasPassword
              ? "Change your sign-in password."
              : "Set a password to sign in with email (Google will still work)."}
          </p>
        </div>
        {hasPassword ? (
          <Field
            label="Current password"
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="New password"
            id="new-password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            hint="At least 8 characters"
          />
          <Field
            label="Confirm password"
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
        </div>
        <Status message={passwordStatus} error={passwordError} />
        <button
          type="submit"
          disabled={passwordSaving}
          className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium disabled:opacity-50"
        >
          {passwordSaving ? "Updating…" : hasPassword ? "Update password" : "Set password"}
        </button>
      </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Sessions</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Sign out on this device or revoke all active sessions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={sessionBusy}
            onClick={() => void logout()}
            className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium transition hover:border-red-500/40 hover:text-red-600 disabled:opacity-50"
          >
            Log out
          </button>
          <button
            type="button"
            disabled={sessionBusy}
            onClick={() => void revokeAllSessions()}
            className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--foreground)]/25 hover:text-[var(--foreground)] disabled:opacity-50"
          >
            Sign out everywhere
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/40 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Platform shortcuts</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/admin/storefronts" className="text-[var(--accent)] hover:underline">
              Manage creator storefronts →
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className="text-[var(--accent)] hover:underline">
              Users &amp; roles →
            </Link>
          </li>
          <li>
            <Link href="/admin/site" className="text-[var(--accent)] hover:underline">
              Landing page &amp; site CMS →
            </Link>
          </li>
        </ul>
      </section>
      </div>
    </div>
  );
}
