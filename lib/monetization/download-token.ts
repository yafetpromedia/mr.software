import jwt from "jsonwebtoken";
import { DOWNLOAD_TOKEN_TTL_SEC } from "./constants";

const PURPOSE = "asset-download";

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s?.trim()) {
    throw new Error("JWT_SECRET is not configured");
  }
  return s;
}

export type DownloadTokenPayload = {
  softwareId: string;
  userId: string;
};

export function signDownloadToken(input: DownloadTokenPayload): string {
  return jwt.sign(
    { purpose: PURPOSE, softwareId: input.softwareId },
    secret(),
    {
      subject: input.userId,
      expiresIn: DOWNLOAD_TOKEN_TTL_SEC,
      algorithm: "HS256",
    },
  );
}

export function verifyDownloadToken(token: string): DownloadTokenPayload {
  const decoded = jwt.verify(token, secret(), {
    algorithms: ["HS256"],
  }) as jwt.JwtPayload & { purpose?: unknown; softwareId?: unknown };

  if (decoded.purpose !== PURPOSE) {
    throw new Error("Invalid download token");
  }
  if (typeof decoded.softwareId !== "string" || !decoded.softwareId) {
    throw new Error("Invalid download token");
  }
  if (typeof decoded.sub !== "string" || !decoded.sub) {
    throw new Error("Invalid download token");
  }

  return { softwareId: decoded.softwareId, userId: decoded.sub };
}
