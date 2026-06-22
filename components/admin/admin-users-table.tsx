"use client";

import { useState } from "react";
import {
  Check,
  Code2,
  Loader2,
  Shield,
  Upload,
  User,
  Wallet,
} from "lucide-react";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  canUpload: boolean;
  canPublish: boolean;
  canWithdraw: boolean;
  createdAt: string;
  hasGoogle: boolean;
};

const STATUSES = ["ACTIVE", "RESTRICTED", "SUSPENDED", "BANNED"] as const;
const ROLES = ["USER", "DEVELOPER", "ADMIN"] as const;

const ROLE_STYLE: Record<string, string> = {
  ADMIN: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  DEVELOPER: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  USER: "border-stone-200 bg-stone-50 text-stone-700 dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--muted)]",
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  RESTRICTED: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  SUSPENDED: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  BANNED: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
};

const CAPABILITIES = [
  { key: "canUpload" as const, label: "Upload", icon: Upload },
  { key: "canPublish" as const, label: "Publish", icon: Code2 },
  { key: "canWithdraw" as const, label: "Withdraw", icon: Wallet },
];

type Props = {
  users: AdminUserRow[];
  currentUserId: string;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarHue(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hues = ["from-orange-400 to-amber-500", "from-sky-400 to-blue-500", "from-violet-400 to-purple-500", "from-emerald-400 to-teal-500"];
  return hues[Math.abs(hash) % hues.length];
}

export function AdminUsersTable({ users: initialUsers, currentUserId }: Props) {
  const [rows, setRows] = useState<AdminUserRow[]>(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const [permDraft, setPermDraft] = useState(() =>
    Object.fromEntries(
      initialUsers.map((u) => [
        u.id,
        {
          canUpload: u.canUpload,
          canPublish: u.canPublish,
          canWithdraw: u.canWithdraw,
        },
      ]),
    ) as Record<string, { canUpload: boolean; canPublish: boolean; canWithdraw: boolean }>,
  );

  async function patchRole(id: string, role: string) {
    setMessage(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Update failed";
        setMessage({ text: err, ok: false });
        return;
      }
      const user =
        data && typeof data === "object" && "user" in data
          ? (data as { user: { role: string } }).user
          : null;
      if (user) {
        setRows((r) => r.map((x) => (x.id === id ? { ...x, role: user.role } : x)));
      }
      setMessage({ text: "Role updated", ok: true });
    } finally {
      setBusyId(null);
    }
  }

  async function patchStatus(id: string, status: string) {
    setMessage(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Update failed";
        setMessage({ text: err, ok: false });
        return;
      }
      const user =
        data && typeof data === "object" && "user" in data
          ? (data as {
              user: {
                status: string;
                canUpload: boolean;
                canPublish: boolean;
                canWithdraw: boolean;
              };
            }).user
          : null;
      if (user) {
        setRows((r) =>
          r.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status: user.status,
                  canUpload: user.canUpload,
                  canPublish: user.canPublish,
                  canWithdraw: user.canWithdraw,
                }
              : x,
          ),
        );
        setPermDraft((d) => ({
          ...d,
          [id]: {
            canUpload: user.canUpload,
            canPublish: user.canPublish,
            canWithdraw: user.canWithdraw,
          },
        }));
      }
      setMessage({ text: "Status updated", ok: true });
    } finally {
      setBusyId(null);
    }
  }

  async function savePermissions(id: string) {
    const d = permDraft[id];
    if (!d) return;
    setMessage(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(d),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Update failed";
        setMessage({ text: err, ok: false });
        return;
      }
      const user =
        data && typeof data === "object" && "user" in data
          ? (data as {
              user: {
                canUpload: boolean;
                canPublish: boolean;
                canWithdraw: boolean;
              };
            }).user
          : null;
      if (user) {
        setRows((r) =>
          r.map((x) =>
            x.id === id
              ? {
                  ...x,
                  canUpload: user.canUpload,
                  canPublish: user.canPublish,
                  canWithdraw: user.canWithdraw,
                }
              : x,
          ),
        );
        setPermDraft((d) => ({
          ...d,
          [id]: {
            canUpload: user.canUpload,
            canPublish: user.canPublish,
            canWithdraw: user.canWithdraw,
          },
        }));
      }
      setMessage({ text: "Capabilities saved", ok: true });
    } finally {
      setBusyId(null);
    }
  }

  function togglePerm(id: string, key: "canUpload" | "canPublish" | "canWithdraw") {
    setPermDraft((d) => ({
      ...d,
      [id]: { ...d[id], [key]: !d[id][key] },
    }));
  }

  const permsDirty = (u: AdminUserRow) => {
    const d = permDraft[u.id];
    if (!d) return false;
    return (
      d.canUpload !== u.canUpload ||
      d.canPublish !== u.canPublish ||
      d.canWithdraw !== u.canWithdraw
    );
  };

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
          <User className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <p className="mt-4 text-base font-semibold text-[var(--foreground)]">No users found</p>
        <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">
          Try clearing filters or search with a different email.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            message.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          }`}
        >
          {message.ok ? (
            <Check className="h-4 w-4 shrink-0" strokeWidth={2} />
          ) : (
            <Shield className="h-4 w-4 shrink-0" strokeWidth={2} />
          )}
          {message.text}
        </div>
      ) : null}

      <ul className="space-y-3">
        {rows.map((u) => {
          const busy = busyId === u.id;
          const draft = permDraft[u.id];
          const dirty = permsDirty(u);

          return (
            <li
              key={u.id}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:border-[var(--accent)]/20 hover:shadow-md dark:bg-[var(--surface-elevated)]"
            >
              <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:gap-6">
                {/* Identity */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarHue(u.name)} text-sm font-bold text-white shadow-sm`}
                    aria-hidden
                  >
                    {initials(u.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-[var(--foreground)]">{u.name}</p>
                      {u.id === currentUserId ? (
                        <span className="rounded-full bg-[var(--accent-muted)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--accent)]">
                          You
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-[var(--muted)]">{u.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {u.hasGoogle ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--foreground)]">
                          Google
                        </span>
                      ) : null}
                      <span className="text-[0.65rem] text-[var(--muted)]">
                        Joined{" "}
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role & status */}
                <div className="flex flex-wrap gap-3 sm:gap-4 lg:shrink-0">
                  <div className="min-w-[8.5rem]">
                    <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Role
                    </p>
                    <div className="relative">
                      <select
                        value={u.role}
                        disabled={busy}
                        onChange={(e) => void patchRole(u.id, e.target.value)}
                        className={`w-full appearance-none rounded-xl border py-2 pl-3 pr-8 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50 ${ROLE_STYLE[u.role] ?? ROLE_STYLE.USER}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                        ▾
                      </span>
                    </div>
                  </div>
                  <div className="min-w-[8.5rem]">
                    <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Status
                    </p>
                    <div className="relative">
                      <select
                        value={u.status}
                        disabled={busy}
                        onChange={(e) => void patchStatus(u.id, e.target.value)}
                        className={`w-full appearance-none rounded-xl border py-2 pl-3 pr-8 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50 ${STATUS_STYLE[u.status] ?? STATUS_STYLE.ACTIVE}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                        ▾
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--background)]/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:bg-[var(--background)]/30">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Capabilities
                  </span>
                  {draft
                    ? CAPABILITIES.map(({ key, label, icon: Icon }) => {
                        const on = draft[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={busy}
                            onClick={() => togglePerm(u.id, key)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                              on
                                ? "border-[var(--accent)]/40 bg-[var(--accent-muted)] text-[var(--accent)]"
                                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {label}
                          </button>
                        );
                      })
                    : null}
                </div>
                <button
                  type="button"
                  disabled={busy || !dirty}
                  onClick={() => void savePermissions(u.id)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                  ) : (
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  Save capabilities
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
