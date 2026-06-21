import type { StorefrontSocialLinks as StorefrontSocialLinksType } from "@/lib/storefront/social-links";
import { listPublicSocialLinks } from "@/lib/storefront/social-links";
import { SocialPlatformIcon } from "@/components/storefront/social-platform-icons";

type Props = {
  links: StorefrontSocialLinksType;
  variant?: "default" | "midnight" | "minimal";
  className?: string;
};

export function StorefrontSocialLinks({
  links,
  variant = "default",
  className = "",
}: Props) {
  const items = listPublicSocialLinks(links);
  if (items.length === 0) return null;

  const buttonClass =
    variant === "midnight"
      ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-violet-500/40 hover:bg-zinc-800 hover:text-violet-300"
      : variant === "minimal"
        ? "border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:text-orange-600 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--muted)] dark:hover:text-[var(--accent)]"
        : "border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-[var(--border)] dark:bg-[var(--surface)] dark:text-[var(--muted)] dark:hover:border-[var(--accent)]/35 dark:hover:text-[var(--accent)]";

  const labelClass =
    variant === "midnight"
      ? "text-zinc-500"
      : "text-stone-500 dark:text-[var(--muted)]";

  return (
    <div className={className}>
      <p className={`text-[0.65rem] font-bold uppercase tracking-wider ${labelClass}`}>
        Follow elsewhere
      </p>
      <ul className={`mt-2.5 flex flex-wrap gap-2 ${variant === "midnight" ? "md:justify-end" : ""}`}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={`${item.label} (opens in new tab)`}
              aria-label={`Follow on ${item.label}`}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${buttonClass}`}
            >
              <SocialPlatformIcon platform={item.id} className="h-[1.125rem] w-[1.125rem]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
