export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "mr-theme";

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  return v === "dark" || v === "light" ? v : null;
}
