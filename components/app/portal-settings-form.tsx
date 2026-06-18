"use client";

export function PortalSettingsForm() {
  return (
    <button
      type="button"
      className="inline-flex h-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 px-5 text-sm font-semibold text-red-700 transition hover:border-red-500/50 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:text-red-300"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        window.location.href = "/";
      }}
    >
      Log out on this device
    </button>
  );
}
