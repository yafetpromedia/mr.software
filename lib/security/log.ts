type SecurityEventType =
  | "FAILED_LOGIN"
  | "RATE_LIMITED"
  | "SUSPICIOUS_ZIP"
  | "SSRF_BLOCK"
  | "VALIDATION_ERROR";

type Meta = Record<string, unknown> | undefined;

/**
 * Structured security lines for operators (SIEM, log shipping). Never log secrets.
 * Extend with a DB or queue when you need long-term forensics.
 */
export function logSecurityEvent(
  type: SecurityEventType,
  message: string,
  meta: Meta = undefined,
): void {
  const line = {
    t: "security",
    type,
    message,
    ...meta,
    ts: new Date().toISOString(),
  };
  if (type === "FAILED_LOGIN" || type === "RATE_LIMITED" || type === "SUSPICIOUS_ZIP") {
    console.warn(JSON.stringify(line));
  } else {
    console.info(JSON.stringify(line));
  }
}
