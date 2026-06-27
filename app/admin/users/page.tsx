import type { Metadata } from "next";
import Link from "next/link";
import { UserStatus, Role, type Prisma } from "@prisma/client";
import { Filter, Search, Shield, UserCheck, Users } from "lucide-react";
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
    ...(q ? { email: { contains: q, mode: "insensitive" as const } } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [users, totalUsers, developerCount, activeCount] = await Promise.all([
    prisma.user.findMany({
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
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.DEVELOPER } }),
    prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
  ]);

  const serialized = users.map(({ googleId, ...u }) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    hasGoogle: Boolean(googleId),
  }));

  const activeFilter = statusFilter === UserStatus.ACTIVE;

  const stats = [
    {
      label: "Total accounts",
      value: String(totalUsers),
      icon: Users,
      hint: q || statusFilter ? `${users.length} in view` : undefined,
    },
    {
      label: "Developers",
      value: String(developerCount),
      icon: UserCheck,
      hint: undefined,
    },
    {
      label: "Active",
      value: String(activeCount),
      icon: Shield,
      hint: undefined,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400/15 to-violet-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Operations
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Users
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Update roles, status, and capability flags. Changes apply on the next sign-in for JWT
            refresh.
          </p>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, hint }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)]/80 px-4 py-3 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xl font-bold tabular-nums text-[var(--foreground)]">{value}</p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {label}
                </p>
                {hint ? <p className="text-[0.65rem] text-[var(--muted)]">{hint}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </header>

      <form
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5"
        action="/admin/users"
        method="get"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="user-search-q"
              className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
              Search email
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
                aria-hidden
              />
              <input
                id="user-search-q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="name@example.com"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {validStatus && validStatus !== UserStatus.ACTIVE ? (
              <input type="hidden" name="status" value={validStatus} />
            ) : null}
            {validStatus && validStatus !== UserStatus.ACTIVE ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
                Status: <strong className="text-[var(--foreground)]">{validStatus}</strong>
                <Link
                  className="ml-1 text-[var(--accent)] hover:underline"
                  href={q ? `/admin/users?q=${encodeURIComponent(q)}` : "/admin/users"}
                >
                  Clear
                </Link>
              </span>
            ) : (
              <label className="flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/30">
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
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)]"
            >
              Apply filters
            </button>
            <Link
              href="/admin/users"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/30"
            >
              Reset
            </Link>
          </div>
        </div>
      </form>

      {q || statusFilter ? (
        <p className="text-sm text-[var(--muted)]">
          Showing <span className="font-semibold text-[var(--foreground)]">{users.length}</span>{" "}
          result{users.length === 1 ? "" : "s"}
          {q ? (
            <>
              {" "}
              matching <span className="font-medium text-[var(--foreground)]">“{q}”</span>
            </>
          ) : null}
          {statusFilter ? (
            <>
              {" "}
              · status{" "}
              <span className="font-medium text-[var(--foreground)]">{statusFilter}</span>
            </>
          ) : null}
        </p>
      ) : null}

      <AdminUsersTable users={serialized} currentUserId={session.id} />
    </div>
  );
}
