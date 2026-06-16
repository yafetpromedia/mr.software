import { platformSummary, type ProductPlatforms } from "@/lib/software-platforms";

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3.609 1.814 13.792 12 3.61 22.186a1.003 1.003 0 0 1-.61-.92V2.734a1.003 1.003 0 0 1 .609-.92Zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635Zm3.199-3.198 2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491ZM5.864 2.658 16.8 8.99l-2.302 2.302L5.864 2.658Z" />
    </svg>
  );
}

function AppStoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
    </svg>
  );
}

function WebIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.559" />
    </svg>
  );
}

const linkClass =
  "inline-flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-900 transition hover:border-orange-300 hover:bg-orange-50/50 dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--foreground)] dark:hover:border-[var(--accent)]/35";

export function ProductPlatformLinks({
  platforms,
  compact = false,
}: {
  platforms: ProductPlatforms;
  compact?: boolean;
}) {
  const playUrl = platforms.playStoreUrl?.trim();
  const appUrl = platforms.appStoreUrl?.trim();
  const hasMobile = Boolean(playUrl || appUrl);

  if (!hasMobile && compact) return null;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact ? (
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--muted)]">
            Get it on
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-[var(--muted)]">
            {platformSummary(platforms)} — buy or download on web, or install from the stores.
          </p>
        </div>
      ) : null}

      <div className="grid gap-2">
        <div
          className={`${linkClass} cursor-default border-dashed opacity-90`}
          aria-label="Available on web via Mr.Software"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-[var(--accent-muted)] dark:text-[var(--accent)]">
            <WebIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-xs text-stone-500 dark:text-[var(--muted)]">Mr.Software</span>
            <span className="block font-semibold">Web · download or buy here</span>
          </span>
        </div>

        {playUrl ? (
          <a
            href={playUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              <GooglePlayIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-xs text-stone-500 dark:text-[var(--muted)]">Google Play</span>
              <span className="block font-semibold">Get it on Play Store</span>
            </span>
          </a>
        ) : null}

        {appUrl ? (
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
              <AppStoreIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-xs text-stone-500 dark:text-[var(--muted)]">App Store</span>
              <span className="block font-semibold">Download on the App Store</span>
            </span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function ProductPlatformBadges({ platforms }: { platforms: ProductPlatforms }) {
  const playUrl = platforms.playStoreUrl?.trim();
  const appUrl = platforms.appStoreUrl?.trim();

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-stone-600 dark:bg-[var(--background)] dark:text-[var(--muted)]">
        Web
      </span>
      {playUrl ? (
        <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
          Play
        </span>
      ) : null}
      {appUrl ? (
        <span className="rounded-md bg-stone-900 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white dark:bg-stone-100 dark:text-stone-900">
          iOS
        </span>
      ) : null}
    </span>
  );
}
