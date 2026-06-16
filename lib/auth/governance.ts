import type { AuthSession } from "@/lib/auth/session";
import { canPublishSoftware } from "@/lib/auth/rbac";

/** Creating a new software listing (upload). */
export function assertCanUploadSoftware(
  session: AuthSession,
): { ok: true } | { ok: false; message: string } {
  if (!canPublishSoftware(session.role)) {
    return {
      ok: false,
      message: "Only developers and admins can upload software",
    };
  }
  if (session.status !== "ACTIVE") {
    return {
      ok: false,
      message: "Account must be active to upload software",
    };
  }
  if (!session.canUpload) {
    return {
      ok: false,
      message: "Upload is disabled for this account",
    };
  }
  return { ok: true };
}

/** Publishing / listing go-live (use when you split publish from draft upload). */
export function assertCanPublishListing(
  session: AuthSession,
): { ok: true } | { ok: false; message: string } {
  if (!canPublishSoftware(session.role)) {
    return {
      ok: false,
      message: "Only developers and admins can publish",
    };
  }
  if (session.status !== "ACTIVE") {
    return {
      ok: false,
      message: "Account must be active to publish",
    };
  }
  if (!session.canPublish) {
    return {
      ok: false,
      message: "Publishing is disabled for this account",
    };
  }
  return { ok: true };
}

/** Payouts / withdrawals (future payment routes). */
export function assertCanWithdrawFunds(
  session: AuthSession,
): { ok: true } | { ok: false; message: string } {
  if (session.status !== "ACTIVE") {
    return {
      ok: false,
      message: "Account must be active for withdrawals",
    };
  }
  if (!session.canWithdraw) {
    return {
      ok: false,
      message: "Withdrawals are disabled for this account",
    };
  }
  return { ok: true };
}
