/** Heroicons solid — checkmark in circle (standard verified icon) */
function VerifiedCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const VARIANTS = {
  onColor: "border-sky-300 bg-sky-500 text-white shadow-md shadow-sky-900/20",
  light: "border-sky-400/50 bg-sky-500 text-white shadow-sm",
  default: "border-sky-600/30 bg-sky-500 text-white shadow-sm dark:border-sky-400/40 dark:bg-sky-500",
} as const;

export function VerifiedBadge({
  variant = "default",
  size = "md",
}: {
  variant?: keyof typeof VARIANTS;
  size?: "sm" | "md";
}) {
  const compact = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wide ${VARIANTS[variant]} ${
        compact ? "px-1.5 py-0.5 text-[0.55rem]" : "px-2.5 py-0.5 text-[0.65rem]"
      }`}
      title="Verified by Mr.Software"
    >
      <VerifiedCheckIcon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {compact ? null : "Verified"}
    </span>
  );
}

/** Checkmark badge on avatar corner */
export function VerifiedAvatarMark() {
  return (
    <span
      className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-sky-500 text-white shadow-md dark:border-zinc-900"
      title="Verified"
    >
      <VerifiedCheckIcon className="h-4 w-4" />
    </span>
  );
}
