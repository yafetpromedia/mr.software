export type SidebarVisibility = "expanded" | "closed";

export const SIDEBAR_STORAGE_KEYS = {
  admin: "mr-software.admin-sidebar",
  library: "mr-software.library-sidebar",
} as const;

export function loadSidebarVisibility(
  storageKey: string,
  fallback: SidebarVisibility = "expanded",
): SidebarVisibility {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === "expanded" || raw === "closed") return raw;
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveSidebarVisibility(storageKey: string, state: SidebarVisibility) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey, state);
  } catch {
    // ignore quota errors
  }
}
