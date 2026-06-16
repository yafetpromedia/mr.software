"use client";

import { useState } from "react";

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

const STATUSES = [
  "ACTIVE",
  "RESTRICTED",
  "SUSPENDED",
  "BANNED",
] as const;

const ROLES = ["USER", "DEVELOPER", "ADMIN"] as const;

type Props = {
  users: AdminUserRow[];
  currentUserId: string;
};

export function AdminUsersTable({ users: initialUsers, currentUserId }: Props) {
  const [rows, setRows] = useState<AdminUserRow[]>(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
    ) as Record<
      string,
      { canUpload: boolean; canPublish: boolean; canWithdraw: boolean }
    >,
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
        setMessage(err);
        return;
      }
      const user =
        data && typeof data === "object" && "user" in data
          ? (data as { user: { role: string } }).user
          : null;
      if (user) {
        setRows((r) => r.map((x) => (x.id === id ? { ...x, role: user.role } : x)));
      }
      setMessage("Role updated.");
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
        setMessage(err);
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
      setMessage("Status updated.");
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
        setMessage(err);
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
      setMessage("Permissions saved.");
    } finally {
      setBusyId(null);
    }
  }

  function togglePerm(
    id: string,
    key: "canUpload" | "canPublish" | "canWithdraw",
  ) {
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

  return (
    <div className="space-y-4">
      {message ? (
        <p
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)] dark:bg-[var(--surface-elevated)]"
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm dark:bg-[var(--surface-elevated)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <th className="px-4 py-3 sm:px-5">User</th>
              <th className="px-4 py-3 sm:px-5">Role</th>
              <th className="px-4 py-3 sm:px-5">Status</th>
              <th className="px-4 py-3 sm:px-5">Capabilities</th>
              <th className="px-4 py-3 sm:px-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((u) => {
              const busy = busyId === u.id;
              const draft = permDraft[u.id];
              return (
                <tr
                  key={u.id}
                  className="bg-[var(--surface)] transition-colors hover:bg-[var(--accent-muted)]/30 dark:bg-[var(--surface-elevated)] dark:hover:bg-[var(--accent-muted)]/20"
                >
                  <td className="px-4 py-4 align-top sm:px-5">
                    <p className="font-medium text-[var(--foreground)]">
                      {u.name}
                      {u.id === currentUserId ? (
                        <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                          (you)
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {u.email}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {u.hasGoogle ? (
                        <span className="rounded-md bg-[var(--accent-muted)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--accent)]">
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
                  </td>
                  <td className="px-4 py-4 align-top sm:px-5">
                    <select
                      value={u.role}
                      disabled={busy}
                      onChange={(e) => void patchRole(u.id, e.target.value)}
                      className="w-full max-w-[11rem] rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 align-top sm:px-5">
                    <select
                      value={u.status}
                      disabled={busy}
                      onChange={(e) => void patchStatus(u.id, e.target.value)}
                      className="w-full max-w-[11rem] rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 align-top sm:px-5">
                    {draft ? (
                      <div className="flex flex-col gap-2">
                        {(
                          [
                            ["canUpload", "Upload"],
                            ["canPublish", "Publish"],
                            ["canWithdraw", "Withdraw"],
                          ] as const
                        ).map(([key, label]) => (
                          <label
                            key={key}
                            className="flex cursor-pointer items-center gap-2 text-xs text-[var(--foreground)]"
                          >
                            <input
                              type="checkbox"
                              checked={draft[key]}
                              disabled={busy}
                              onChange={() => togglePerm(u.id, key)}
                              className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--ring)]"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 align-top sm:px-5">
                    <button
                      type="button"
                      disabled={busy || !permsDirty(u)}
                      onClick={() => void savePermissions(u.id)}
                      className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {busy ? "…" : "Save caps"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
