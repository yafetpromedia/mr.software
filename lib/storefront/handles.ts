const RESERVED_HANDLES = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "login",
  "register",
  "marketplace",
  "software",
  "deploy",
  "projects",
  "settings",
  "startup",
  "startups",
  "download",
  "downloads",
  "checkout",
  "webhooks",
  "www",
  "help",
  "support",
  "blog",
  "docs",
  "status",
  "team",
  "partners",
  "testimonials",
  "builder",
  "earnings",
  "payouts",
  "listings",
  "academy",
  "report",
  "cloud",
  "studio",
  "mrsoftware",
  "mr-software",
]);

const HANDLE_PATTERN = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export function normalizeHandle(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_-]/g, "");
}

export function validateHandle(handle: string): string | null {
  const value = normalizeHandle(handle);
  if (!value) return "Handle is required";
  if (value.length < 3) return "Handle must be at least 3 characters";
  if (value.length > 30) return "Handle must be 30 characters or fewer";
  if (!HANDLE_PATTERN.test(value)) {
    return "Use lowercase letters, numbers, hyphens, or underscores";
  }
  if (RESERVED_HANDLES.has(value)) return "This handle is reserved";
  return null;
}

export function storefrontPath(handle: string): string {
  return `/@${normalizeHandle(handle)}`;
}

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(normalizeHandle(handle));
}
