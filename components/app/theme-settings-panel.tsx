"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { useHydrated } from "@/hooks/use-hydrated";
import type { Theme } from "@/lib/theme";

const OPTIONS: Array<{ id: Theme; label: string; description: string; icon: typeof Sun }> = [
  {
    id: "light",
    label: "Light",
    description: "Bright workspace — best for daytime and readability.",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Low-glare interface — easier on the eyes at night.",
    icon: Moon,
  },
];

export function ThemeSettingsPanel() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();

  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Color theme</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = hydrated && theme === option.id;
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-muted)]/40 ring-1 ring-[var(--accent)]/30"
                  : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/25"
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={option.id}
                checked={selected}
                onChange={() => setTheme(option.id)}
                className="sr-only"
              />
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--foreground)]">{option.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-[var(--muted)]">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {!hydrated ? (
        <p className="text-xs text-[var(--muted)]">Loading appearance preference…</p>
      ) : null}
    </fieldset>
  );
}
