import type {
  UserReportReason,
  UserReportStatus,
  UserReportTargetType,
} from "@prisma/client";

export type AdminUserReport = {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  targetType: UserReportTargetType;
  targetId: string;
  targetLabel: string;
  targetHref: string | null;
  reason: UserReportReason;
  details: string | null;
  status: UserReportStatus;
  resolution: string | null;
  resolvedAt: string | null;
  resolvedByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReportQueueStats = {
  open: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
  total: number;
};

export const REPORT_REASON_LABEL: Record<UserReportReason, string> = {
  SPAM: "Spam",
  SCAM: "Scam or fraud",
  COPYRIGHT: "Copyright",
  INAPPROPRIATE: "Inappropriate content",
  MISLEADING: "Misleading listing",
  OTHER: "Other",
};

export const REPORT_STATUS_LABEL: Record<UserReportStatus, string> = {
  OPEN: "Open",
  REVIEWING: "Reviewing",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export const REPORT_TARGET_LABEL: Record<UserReportTargetType, string> = {
  SOFTWARE: "Listing",
  STOREFRONT: "Storefront",
  USER: "User account",
};
