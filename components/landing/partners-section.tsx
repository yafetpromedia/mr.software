"use client";

import { BrandAssetImage } from "@/components/brand/brand-asset-image";
import { motion, useReducedMotion } from "framer-motion";
import { defaultPartners, normalizePartnerHref, type Partner } from "@/lib/landing/partners";

function PartnerLogo({ p }: { p: Partner }) {
  const label = p.label ?? p.name;
  const href = normalizePartnerHref(p.href);
  const inner = p.logo ? (
    <div className="relative h-11 w-[9.5rem] sm:h-12 sm:w-[10.5rem]">
      <BrandAssetImage
        src={p.logo}
        alt={label}
        fill
        className="object-contain object-center opacity-80 transition duration-300 group-hover:opacity-100"
        sizes="(max-width: 640px) 140px, 168px"
      />
    </div>
  ) : (
    <span className="text-center text-sm font-semibold tracking-tight text-[var(--foreground)]">
      {p.name}
    </span>
  );

  const className =
    "group flex min-h-[3rem] w-[10.5rem] max-w-full flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 shadow-sm backdrop-blur-sm transition duration-300 hover:scale-[1.03] hover:border-[var(--accent)]/30 hover:shadow-md dark:bg-zinc-900/40";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={label}
      >
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
}

export function PartnersSection({ partners = defaultPartners }: { partners?: Partner[] }) {
  const reduce = useReducedMotion();
  if (partners.length === 0) return null;

  return (
    <section
      id="partners"
      className="relative scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
      aria-labelledby="partners-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--background)] to-[var(--surface)]/15"
        aria-hidden
      />
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply dark:opacity-12" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Trusted by
          </p>
          <h2
            id="partners-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl"
          >
            Partnerships & sponsors
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
            Logos and teams that align with the bar we set for security,
            quality, and shipping.
          </p>
        </motion.div>

        <motion.ul
          className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:mt-12 sm:gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-20px" }}
          role="list"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 },
            },
          }}
        >
          {partners.map((p, index) => (
            <motion.li
              key={`${index}-${p.name}-${p.logo ?? "text"}`}
              variants={{
                hidden: reduce
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
              className="saturate-0 transition duration-300 hover:saturate-100"
            >
              <PartnerLogo p={p} />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
