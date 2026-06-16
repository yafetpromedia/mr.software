import type { Metadata } from "next";
import Link from "next/link";
import { UserStatus, type Prisma } from "@prisma/client";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { isActiveAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage users and permissions",
};

const STATUS_VALUES = Object.values(UserStatus);

type Props = {
  searchParams: Promise<{
    q?: string;
    active?: string;
    status?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session || !isActiveAdmin(session)) {
    return null;
  }

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const active = sp.active;
  const statusRaw = typeof sp.status === "string" ? sp.status : undefined;
  const validStatus =
    statusRaw && STATUS_VALUES.includes(statusRaw as UserStatus)
      ? (statusRaw as UserStatus)
      : null;

  let statusFilter: UserStatus | undefined;
  if (validStatus) {
    statusFilter = validStatus;
  } else if (active === "1" || active === "true") {
    statusFilter = UserStatus.ACTIVE;
  }

  const where: Prisma.UserWhereInput = {
    ...(q
      ? { email: { contains: q, mode: "insensitive" as const } }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      canUpload: true,
      canPublish: true,
      canWithdraw: true,
      createdAt: true,
      googleId: true,
    },
  });

  const serialized = users.map(({ googleId, ...u }) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    hasGoogle: Boolean(googleId),
  }));

  const activeFilter =
    statusFilter === UserStatus.ACTIVE ? true : false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Users
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Update account status and capability flags. Changes apply immediately
          for new requests; JWTs refresh on next sign-in.
        </p>
      </div>

      <form
        className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between dark:bg-[var(--surface-elevated)]"
        action="/admin/users"
        method="get"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-md">
          <label
            htmlFor="user-search-q"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
          >
            Search email
          </label>
          <input
            id="user-search-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="name@…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {validStatus && validStatus !== UserStatus.ACTIVE ? (
            <input type="hidden" name="status" value={validStatus} />
          ) : null}
          {validStatus && validStatus !== UserStatus.ACTIVE ? (
            <span className="text-xs text-[var(--muted)]">
              Status filter:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {validStatus}
              </span>{" "}
              (from URL —{" "}
              <Link
                className="text-[var(--accent)] underline-offset-2 hover:underline"
                href={q ? `/admin/users?q=${encodeURIComponent(q)}` : "/admin/users"}
              >
                clear
              </Link>
              )
            </span>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                name="active"
                value="1"
                defaultChecked={activeFilter}
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--ring)]"
              />
              Active only
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)]"
            >
              Apply
            </button>
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
            >
              Clear
            </Link>
          </div>
        </div>
      </form>
      {q || statusFilter ? (
        <p className="text-sm text-[var(--muted)]">
          Showing {users.length} result{users.length === 1 ? "" : "s"}
          {q ? ` matching “${q}”` : ""}
          {statusFilter ? ` · status ${statusFilter}` : ""}
        </p>
      ) : null}

      <AdminUsersTable users={serialized} currentUserId={session.id} />
    </div>
  );
}
