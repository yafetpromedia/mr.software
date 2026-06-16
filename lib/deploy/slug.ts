export function slugifyProjectName(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s || "project";
}

export function userShortId(userId: string): string {
  return userId.replace(/-/g, "").slice(0, 8);
}
