import { DeveloperAccessRequestStatus, Role, UserStatus, type DeveloperAccessRequest } from "@prisma/client";
import { logAdminAction } from "@/lib/admin/audit";
import type {
  AdminDeveloperAccessRequest,
  DeveloperAccessQueueStats,
  DeveloperAccessRequestView,
} from "@/lib/developer-access/types";
import { prisma } from "@/lib/prisma";

export {
  DEVELOPER_ACCESS_STATUS_LABEL,
} from "@/lib/developer-access/types";
export type {
  AdminDeveloperAccessRequest,
  DeveloperAccessQueueStats,
  DeveloperAccessRequestView,
} from "@/lib/developer-access/types";

export class DeveloperAccessUnavailableError extends Error {
  constructor() {
    super(
      "Developer access requests are unavailable. Run `npx prisma generate` and restart the dev server.",
    );
    this.name = "DeveloperAccessUnavailableError";
  }
}

export class DeveloperAccessValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeveloperAccessValidationError";
  }
}

type RequestDelegate = {
  findFirst: (args: unknown) => Promise<RequestRow | null>;
  findMany: (args: unknown) => Promise<RequestRow[]>;
  findUnique: (args: unknown) => Promise<RequestRow | null>;
  create: (args: unknown) => Promise<RequestRow>;
  update: (args: unknown) => Promise<RequestRow>;
  count: (args?: { where?: { status?: DeveloperAccessRequestStatus } }) => Promise<number>;
};

type RequestRow = DeveloperAccessRequest & {
  user: { id: string; name: string; email: string; status: UserStatus; role: Role };
  reviewedBy: { name: string } | null;
};

function requestsDb(): RequestDelegate | null {
  const delegate = (prisma as unknown as { developerAccessRequest?: RequestDelegate })
    .developerAccessRequest;
  if (!delegate?.findMany || !delegate?.count) return null;
  return delegate;
}

function requireRequestsDb(): RequestDelegate {
  const db = requestsDb();
  if (!db) throw new DeveloperAccessUnavailableError();
  return db;
}

function toView(row: DeveloperAccessRequest): DeveloperAccessRequestView {
  return {
    id: row.id,
    pitch: row.pitch,
    website: row.website,
    status: row.status,
    adminNote: row.adminNote,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toAdminRow(row: RequestRow): AdminDeveloperAccessRequest {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.user.name,
    userEmail: row.user.email,
    userStatus: row.user.status,
    pitch: row.pitch,
    website: row.website,
    status: row.status,
    adminNote: row.adminNote,
    reviewedByName: row.reviewedBy?.name ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getDeveloperAccessForUser(userId: string, role: Role): Promise<{
  role: Role;
  canRequest: boolean;
  request: DeveloperAccessRequestView | null;
}> {
  if (role !== Role.USER) {
    return { role, canRequest: false, request: null };
  }

  const db = requireRequestsDb();
  const latest = await db.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const canRequest = !latest || latest.status !== DeveloperAccessRequestStatus.PENDING;
  return {
    role,
    canRequest,
    request: latest ? toView(latest) : null,
  };
}

export async function submitDeveloperAccessRequest(
  userId: string,
  role: Role,
  input: { pitch: string; website?: string },
): Promise<DeveloperAccessRequestView> {
  if (role !== Role.USER) {
    throw new DeveloperAccessValidationError("Only member accounts can request developer access.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new DeveloperAccessValidationError("Your account must be active to request developer access.");
  }

  const db = requireRequestsDb();
  const pending = await db.findFirst({
    where: { userId, status: DeveloperAccessRequestStatus.PENDING },
  });
  if (pending) {
    throw new DeveloperAccessValidationError("You already have a pending request.");
  }

  const website = input.website?.trim() || null;
  const row = await db.create({
    data: {
      userId,
      pitch: input.pitch.trim(),
      website,
    },
  });

  return toView(row);
}

export async function countPendingDeveloperAccessRequests(): Promise<number> {
  const db = requestsDb();
  if (!db) return 0;
  return db.count({ where: { status: DeveloperAccessRequestStatus.PENDING } });
}

export async function listDeveloperAccessForAdmin(
  status: DeveloperAccessRequestStatus | "ALL",
): Promise<{ requests: AdminDeveloperAccessRequest[]; stats: DeveloperAccessQueueStats }> {
  const db = requireRequestsDb();

  const [pending, approved, rejected, total, rows] = await Promise.all([
    db.count({ where: { status: DeveloperAccessRequestStatus.PENDING } }),
    db.count({ where: { status: DeveloperAccessRequestStatus.APPROVED } }),
    db.count({ where: { status: DeveloperAccessRequestStatus.REJECTED } }),
    db.count(),
    db.findMany({
      where: status === "ALL" ? undefined : { status },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true, status: true, role: true } },
        reviewedBy: { select: { name: true } },
      },
    }),
  ]);

  return {
    requests: rows.map(toAdminRow),
    stats: { pending, approved, rejected, total },
  };
}

export async function reviewDeveloperAccessRequest(input: {
  requestId: string;
  adminId: string;
  action: "approve" | "reject";
  adminNote?: string;
}): Promise<AdminDeveloperAccessRequest> {
  const db = requireRequestsDb();
  const row = await db.findUnique({
    where: { id: input.requestId },
    include: {
      user: { select: { id: true, name: true, email: true, status: true, role: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  if (!row) {
    throw new DeveloperAccessValidationError("Request not found.");
  }
  if (row.status !== DeveloperAccessRequestStatus.PENDING) {
    throw new DeveloperAccessValidationError("This request was already reviewed.");
  }
  if (row.user.status !== UserStatus.ACTIVE) {
    throw new DeveloperAccessValidationError("User account is not active.");
  }

  const note = input.adminNote?.trim() || null;
  const now = new Date();

  if (input.action === "approve") {
    if (row.user.role === Role.DEVELOPER || row.user.role === Role.ADMIN) {
      throw new DeveloperAccessValidationError("User is already a developer or admin.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: row.userId },
        data: { role: Role.DEVELOPER, sessionVersion: { increment: 1 } },
      });
      await tx.developerAccessRequest.update({
        where: { id: row.id },
        data: {
          status: DeveloperAccessRequestStatus.APPROVED,
          adminNote: note,
          reviewedById: input.adminId,
          reviewedAt: now,
        },
      });
    });

    await logAdminAction({
      adminId: input.adminId,
      action: "developer_access.approve",
      targetType: "user",
      targetId: row.userId,
      detail: { requestId: row.id, email: row.user.email },
    });
  } else {
    await db.update({
      where: { id: row.id },
      data: {
        status: DeveloperAccessRequestStatus.REJECTED,
        adminNote: note,
        reviewedById: input.adminId,
        reviewedAt: now,
      },
    });

    await logAdminAction({
      adminId: input.adminId,
      action: "developer_access.reject",
      targetType: "user",
      targetId: row.userId,
      detail: { requestId: row.id, email: row.user.email, note },
    });
  }

  const updated = await db.findUnique({
    where: { id: row.id },
    include: {
      user: { select: { id: true, name: true, email: true, status: true, role: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  if (!updated) {
    throw new DeveloperAccessValidationError("Request not found after update.");
  }

  return toAdminRow(updated);
}
