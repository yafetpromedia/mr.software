import type {
  UserReport,
  UserReportReason,
  UserReportStatus,
  UserReportTargetType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeHandle } from "@/lib/storefront/handles";
import type { AdminUserReport, ReportQueueStats } from "@/lib/reports-types";

export type { AdminUserReport, ReportQueueStats } from "@/lib/reports-types";
export {
  REPORT_REASON_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_TARGET_LABEL,
} from "@/lib/reports-types";

const EMPTY_STATS: ReportQueueStats = {
  open: 0,
  reviewing: 0,
  resolved: 0,
  dismissed: 0,
  total: 0,
};

export class ReportsUnavailableError extends Error {
  constructor() {
    super(
      "Reports database models are unavailable. Run `npx prisma generate` and restart the dev server.",
    );
    this.name = "ReportsUnavailableError";
  }
}

export class ReportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportValidationError";
  }
}

type UserReportDelegate = {
  count: (args?: { where?: { status?: UserReportStatus } }) => Promise<number>;
  findFirst: (args: unknown) => Promise<ReportRow | null>;
  findMany: (args: unknown) => Promise<ReportRow[]>;
  findUnique: (args: { where: { id: string } }) => Promise<ReportRow | null>;
  create: (args: unknown) => Promise<ReportRow>;
  update: (args: unknown) => Promise<ReportRow>;
};

function userReportsDb(): UserReportDelegate | null {
  const delegate = (prisma as unknown as { userReport?: UserReportDelegate }).userReport;
  if (!delegate?.findMany || !delegate?.count) return null;
  return delegate;
}

function requireUserReportsDb(): UserReportDelegate {
  const db = userReportsDb();
  if (!db) throw new ReportsUnavailableError();
  return db;
}

type ReportRow = UserReport & {
  reporter: { name: string; email: string };
  resolvedBy: { name: string } | null;
};

async function resolveTargetLabel(
  targetType: UserReportTargetType,
  targetId: string,
): Promise<{ label: string; href: string | null }> {
  if (targetType === "SOFTWARE") {
    const software = await prisma.software.findUnique({
      where: { id: targetId },
      select: { name: true, id: true },
    });
    if (!software) return { label: "Deleted listing", href: null };
    return {
      label: software.name,
      href: `/software/${software.id}`,
    };
  }

  if (targetType === "STOREFRONT") {
    const storefront = await prisma.developerStorefront.findUnique({
      where: { userId: targetId },
      select: { handle: true, user: { select: { name: true } } },
    });
    if (!storefront) return { label: "Deleted storefront", href: null };
    return {
      label: `@${storefront.handle} · ${storefront.user.name}`,
      href: `/store/${storefront.handle}`,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: { name: true, email: true },
  });
  if (!user) return { label: "Deleted user", href: null };
  return {
    label: `${user.name} (${user.email})`,
    href: `/admin/users?q=${encodeURIComponent(user.email)}`,
  };
}

async function toAdminReport(row: ReportRow): Promise<AdminUserReport> {
  const target = await resolveTargetLabel(row.targetType, row.targetId);
  return {
    id: row.id,
    reporterId: row.reporterId,
    reporterName: row.reporter.name,
    reporterEmail: row.reporter.email,
    targetType: row.targetType,
    targetId: row.targetId,
    targetLabel: target.label,
    targetHref: target.href,
    reason: row.reason,
    details: row.details,
    status: row.status,
    resolution: row.resolution,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    resolvedByName: row.resolvedBy?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getReportQueueStats(): Promise<ReportQueueStats> {
  const db = userReportsDb();
  if (!db) return EMPTY_STATS;

  const [open, reviewing, resolved, dismissed, total] = await Promise.all([
    db.count({ where: { status: "OPEN" } }),
    db.count({ where: { status: "REVIEWING" } }),
    db.count({ where: { status: "RESOLVED" } }),
    db.count({ where: { status: "DISMISSED" } }),
    db.count(),
  ]);
  return { open, reviewing, resolved, dismissed, total };
}

export async function listReportsForAdmin(
  status: UserReportStatus | "ALL",
): Promise<{ reports: AdminUserReport[]; stats: ReportQueueStats }> {
  const db = requireUserReportsDb();
  const where = status === "ALL" ? {} : { status };
  const rows = await db.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: 100,
    include: {
      reporter: { select: { name: true, email: true } },
      resolvedBy: { select: { name: true } },
    },
  });

  const [reports, stats] = await Promise.all([
    Promise.all(rows.map(toAdminReport)),
    getReportQueueStats(),
  ]);

  return { reports, stats };
}

export async function resolveReportTarget(
  targetType: UserReportTargetType,
  rawTargetId: string,
): Promise<{ targetId: string; label: string }> {
  const trimmed = rawTargetId.trim();
  if (!trimmed) throw new ReportValidationError("Please specify what you are reporting.");

  if (targetType === "SOFTWARE") {
    const id = trimmed.replace(/^\/software\//, "").split(/[/?#]/)[0] ?? trimmed;
    const software = await prisma.software.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!software) throw new ReportValidationError("That marketplace listing was not found.");
    return { targetId: software.id, label: software.name };
  }

  if (targetType === "STOREFRONT") {
    const handle = normalizeHandle(trimmed.replace(/^@/, ""));
    const storefront = await prisma.developerStorefront.findUnique({
      where: { handle },
      select: { userId: true, handle: true, user: { select: { name: true } } },
    });
    if (!storefront) throw new ReportValidationError("That developer storefront was not found.");
    return {
      targetId: storefront.userId,
      label: `@${storefront.handle} · ${storefront.user.name}`,
    };
  }

  let user = await prisma.user.findUnique({
    where: { id: trimmed },
    select: { id: true, name: true },
  });
  if (!user && trimmed.includes("@")) {
    user = await prisma.user.findUnique({
      where: { email: trimmed.toLowerCase() },
      select: { id: true, name: true },
    });
  }
  if (!user) throw new ReportValidationError("That user account was not found.");
  return { targetId: user.id, label: user.name };
}

async function assertCanReport(
  reporterId: string,
  targetType: UserReportTargetType,
  targetId: string,
): Promise<void> {
  if (targetType === "USER" && reporterId === targetId) {
    throw new ReportValidationError("You cannot report your own account.");
  }
  if (targetType === "STOREFRONT" && reporterId === targetId) {
    throw new ReportValidationError("You cannot report your own storefront.");
  }
  if (targetType === "SOFTWARE") {
    const software = await prisma.software.findUnique({
      where: { id: targetId },
      select: { developerId: true },
    });
    if (software?.developerId === reporterId) {
      throw new ReportValidationError("You cannot report your own listing.");
    }
  }
}

export async function createUserReport(input: {
  reporterId: string;
  targetType: UserReportTargetType;
  targetId: string;
  reason: UserReportReason;
  details?: string;
  resolveTarget?: boolean;
}): Promise<AdminUserReport> {
  const db = requireUserReportsDb();
  const resolved = input.resolveTarget
    ? await resolveReportTarget(input.targetType, input.targetId)
    : { targetId: input.targetId.trim(), label: input.targetId };

  await assertCanReport(input.reporterId, input.targetType, resolved.targetId);

  const existing = await db.findFirst({
    where: {
      reporterId: input.reporterId,
      targetType: input.targetType,
      targetId: resolved.targetId,
      status: { in: ["OPEN", "REVIEWING"] },
    },
  });
  if (existing) {
    throw new ReportValidationError(
      "You already have an open report for this target. Our team is reviewing it.",
    );
  }

  const row = await db.create({
    data: {
      reporterId: input.reporterId,
      targetType: input.targetType,
      targetId: resolved.targetId,
      reason: input.reason,
      details: input.details?.trim() || null,
    },
    include: {
      reporter: { select: { name: true, email: true } },
      resolvedBy: { select: { name: true } },
    },
  });
  return toAdminReport(row);
}

export async function updateUserReport(
  id: string,
  adminId: string,
  input: {
    status: UserReportStatus;
    resolution?: string | null;
  },
): Promise<AdminUserReport | null> {
  const db = requireUserReportsDb();
  const existing = await db.findUnique({ where: { id } });
  if (!existing) return null;

  const isClosed = input.status === "RESOLVED" || input.status === "DISMISSED";

  const row = await db.update({
    where: { id },
    data: {
      status: input.status,
      resolution:
        input.resolution === undefined
          ? undefined
          : input.resolution?.trim()
            ? input.resolution.trim()
            : null,
      resolvedAt: isClosed ? new Date() : null,
      resolvedById: isClosed ? adminId : null,
    },
    include: {
      reporter: { select: { name: true, email: true } },
      resolvedBy: { select: { name: true } },
    },
  });

  return toAdminReport(row);
}

export async function seedSampleReports(reporterId: string): Promise<void> {
  const db = userReportsDb();
  if (!db) return;

  const count = await db.count();
  if (count > 0) return;

  const software = await prisma.software.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const storefront = await prisma.developerStorefront.findFirst({
    select: { userId: true },
  });

  const samples: {
    targetType: UserReportTargetType;
    targetId: string;
    reason: UserReportReason;
    details: string;
    status: UserReportStatus;
  }[] = [];

  if (software) {
    samples.push(
      {
        targetType: "SOFTWARE",
        targetId: software.id,
        reason: "MISLEADING",
        details:
          "Screenshots show features that are not included in the download. Please review the listing description.",
        status: "OPEN",
      },
      {
        targetType: "SOFTWARE",
        targetId: software.id,
        reason: "COPYRIGHT",
        details: "This template appears to reuse assets from another marketplace without attribution.",
        status: "REVIEWING",
      },
    );
  }

  if (storefront) {
    samples.push({
      targetType: "STOREFRONT",
      targetId: storefront.userId,
      reason: "SPAM",
      details: "Store bio contains unrelated affiliate links and scraped product descriptions.",
      status: "OPEN",
    });
  }

  samples.push({
    targetType: "USER",
    targetId: reporterId,
    reason: "OTHER",
    details: "Demo report — replace with real triage workflow in production.",
    status: "RESOLVED",
  });

  for (const sample of samples) {
    await db.create({
      data: {
        reporterId,
        targetType: sample.targetType,
        targetId: sample.targetId,
        reason: sample.reason,
        details: sample.details,
        status: sample.status,
        resolution:
          sample.status === "RESOLVED"
            ? "Reviewed — no action required for demo seed data."
            : null,
        resolvedAt: sample.status === "RESOLVED" ? new Date() : null,
        resolvedById: sample.status === "RESOLVED" ? reporterId : null,
      },
    });
  }
}
