/** Domains commonly used for throwaway / disposable inboxes. */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "dispostable.com",
  "dropmail.me",
  "emailondeck.com",
  "fakeinbox.com",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mailnull.com",
  "mintemail.com",
  "moakt.com",
  "mytemp.email",
  "sharklasers.com",
  "spam4.me",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "throwaway.email",
  "trashmail.com",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

const BLOCKED_TLDS = new Set(["local", "test", "invalid", "example", "localhost"]);

const BLOCKED_LOCAL_PARTS = new Set([
  "admin",
  "noreply",
  "no-reply",
  "postmaster",
  "root",
  "webmaster",
]);

function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;
  return email.slice(at + 1);
}

function isDisposableDomain(domain: string): boolean {
  const normalized = domain.toLowerCase();
  if (DISPOSABLE_EMAIL_DOMAINS.has(normalized)) return true;
  for (const blocked of DISPOSABLE_EMAIL_DOMAINS) {
    if (normalized.endsWith(`.${blocked}`)) return true;
  }
  return false;
}

/**
 * Returns a user-facing error message when the email fails signup/login policy checks,
 * or `null` when the address is acceptable.
 */
export function getEmailPolicyError(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return "Enter a valid email address";
  }

  const [localPart, domainPart] = normalized.split("@");
  if (!localPart || !domainPart || localPart.includes("..") || domainPart.includes("..")) {
    return "Enter a valid email address";
  }

  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return "Enter a valid email address";
  }

  if (!domainPart.includes(".")) {
    return "Use an email with a real domain (e.g. you@gmail.com)";
  }

  const tld = domainPart.split(".").pop() ?? "";
  if (tld.length < 2) {
    return "Enter a valid email address";
  }

  if (BLOCKED_TLDS.has(tld)) {
    return process.env.NODE_ENV === "production"
      ? "Use a real email address you can access — test domains aren't allowed"
      : null;
  }

  if (BLOCKED_LOCAL_PARTS.has(localPart)) {
    return "Use your personal or work email address";
  }

  if (isDisposableDomain(domainPart)) {
    return "Temporary or disposable email addresses aren't allowed. Use a real inbox you can access.";
  }

  return null;
}
