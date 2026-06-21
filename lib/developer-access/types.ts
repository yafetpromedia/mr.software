import type { DeveloperAccessRequestStatus } from "@prisma/client";

export type DeveloperAccessRequestView = {
  id: string;
  pitch: string;
  website: string | null;
  status: DeveloperAccessRequestStatus;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type AdminDeveloperAccessRequest = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userStatus: string;
  pitch: string;
  website: string | null;
  status: DeveloperAccessRequestStatus;
  adminNote: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type DeveloperAccessQueueStats = {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
};

export const DEVELOPER_ACCESS_STATUS_LABEL: Record<DeveloperAccessRequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};
