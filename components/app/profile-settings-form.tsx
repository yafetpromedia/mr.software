"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialName: string;
  initialEmail: string;
  role: string;
  memberSince: string;
  stripeLinked?: boolean;
};

export function ProfileSettingsForm({
  initialName,
  initialEmail,
  role,
  memberSince,
  stripeLinked = false,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    setError("");

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = (await res.json()) as { error?: string; profile?: { name: string; email: string } };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save profile");
      }
      if (data.profile) {
        setName(data.profile.name);
        setEmail(data.profile.email);
      }
      setStatus("Profile updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const memberDate = new Date(memberSince).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-[var(--foreground)]">
            Display name
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/30 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-[var(--foreground)]">
            Email address
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={320}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/30 focus:ring-2"
          />
        </div>
      </div>

      <dl className="grid gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)]/50 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Account role</dt>
          <dd className="mt-1 font-medium capitalize text-[var(--foreground)]">{role.toLowerCase()}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Member since</dt>
          <dd className="mt-1 font-medium text-[var(--foreground)]">{memberDate}</dd>
        </div>
        {stripeLinked ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Billing</dt>
            <dd className="mt-1 text-[var(--foreground)]">Stripe customer linked for checkout</dd>
          </div>
        ) : null}
      </dl>

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
        className="inline-flex h-11 items-center rounded-xl bg-[var(--foreground)] px-5 text-sm font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
