"use client";

import { useState } from "react";

type Props = {
  hasPassword: boolean;
  hasGoogle: boolean;
};

export function PasswordSettingsForm({ hasPassword, hasGoogle }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setSaving(false);
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
      if (!res.ok) {
        throw new Error(data.error ?? "Could not update password");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus(hasPassword ? "Password updated." : "Password set. You can now sign in with email and password.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {hasGoogle ? (
        <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/50 px-4 py-3 text-sm text-[var(--muted)]">
          Google sign-in is connected
          {hasPassword ? " alongside your password." : ". Set a password below to also sign in with email."}
        </p>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        {hasPassword ? (
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-[var(--foreground)]">
              Current password
            </label>
            <input
              id="current-password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-[var(--foreground)]">
              {hasPassword ? "New password" : "Password"}
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">At least 8 characters</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--foreground)]">
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
            />
          </div>
        </div>

        <div aria-live="polite" className="min-h-[1.25rem]">
          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {status ? (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
              {status}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]/35 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Updating…" : hasPassword ? "Update password" : "Set password"}
        </button>
      </form>
    </div>
  );
}
