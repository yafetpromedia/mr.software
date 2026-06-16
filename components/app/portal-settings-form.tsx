"use client";

export function PortalSettingsForm() {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-red-500/50 hover:text-red-600"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        window.location.href = "/";
      }}
    >
      Log out
    </button>
  );
}
