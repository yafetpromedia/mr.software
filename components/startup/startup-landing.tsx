"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { GeneratedStartupPayload } from "@/lib/startup/types";

type Props = {
  payload: GeneratedStartupPayload;
  startupId: string;
  showBuiltWith?: boolean;
};

function Hero3dDecor({ hue }: { hue: number }) {
  const color = `hsl(${hue} 85% 55%)`;
  const color2 = `hsl(${(hue + 40) % 360} 80% 50%)`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 [perspective:800px]">
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: 360, rotateX: 12 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-4 rounded-3xl border opacity-60"
              style={{
                borderColor: i % 2 === 0 ? color : color2,
                background: `linear-gradient(135deg, ${color}22, transparent)`,
                transform: `rotateY(${i * 60}deg) translateZ(56px)`,
              }}
            />
          ))}
          <div
            className="absolute inset-8 rounded-full blur-2xl"
            style={{ background: `${color}44` }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export function StartupLanding({ payload, startupId, showBuiltWith = true }: Props) {
  const accent = `hsl(${payload.brand.primaryHue} 85% 55%)`;
  const accentSoft = `hsl(${payload.brand.primaryHue} 70% 45% / 0.35)`;
  const accentGlow = `hsl(${payload.brand.primaryHue} 80% 50% / 0.25)`;
  const enable3d = payload.brand.enable3d === true;

  return (
    <motion.div
      className="min-h-screen bg-[#0c0a09] text-stone-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {showBuiltWith ? (
        <div className="border-b border-orange-500/15 bg-black/50 px-4 py-2 text-center text-[0.65rem] text-stone-500 backdrop-blur-md">
          Built with{" "}
          <Link href="/" className="font-medium text-orange-400 hover:text-orange-300">
            Mr.Software
          </Link>
          {" · "}
          <Link
            href={`/startup/${startupId}/dashboard-preview`}
            className="font-medium hover:underline"
            style={{ color: accent }}
          >
            Dashboard preview →
          </Link>
        </div>
      ) : null}

      {payload.landingSections.map((section, i) => {
        if (section.type === "hero") {
          return (
            <section
              key={i}
              className="relative overflow-hidden border-b border-white/8 px-4 py-16 sm:py-24"
            >
              {enable3d ? <Hero3dDecor hue={payload.brand.primaryHue} /> : null}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 90% 70% at 50% -20%, ${accentGlow}, transparent 60%)`,
                }}
                aria-hidden
              />
              <div
                className={`relative mx-auto grid max-w-5xl items-center gap-10 ${
                  section.imageUrl ? "lg:grid-cols-2 lg:text-left" : "max-w-3xl text-center"
                }`}
              >
                <div className={section.imageUrl ? "" : "mx-auto max-w-3xl text-center"}>
                  <span
                    className="inline-block rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider"
                    style={{ borderColor: accentSoft, color: accent }}
                  >
                    {payload.brand.label}
                    {enable3d ? " · 3D" : ""}
                  </span>
                  <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {section.headline}
                  </h1>
                  <p className="mt-4 text-base text-stone-400 sm:text-lg">{section.subheadline}</p>
                  <button
                    type="button"
                    className="mt-8 inline-flex h-11 items-center rounded-xl px-7 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 sm:h-12 sm:px-8"
                    style={{
                      background: `linear-gradient(135deg, hsl(${payload.brand.primaryHue} 75% 42%), ${accent})`,
                      boxShadow: `0 12px 40px -12px ${accentGlow}`,
                    }}
                  >
                    {section.cta}
                  </button>
                </div>
                {section.imageUrl ? (
                  <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl lg:max-w-none">
                    <Image
                      src={section.imageUrl}
                      alt={section.imageAlt ?? section.headline}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 480px"
                      unoptimized
                    />
                    {enable3d ? (
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          );
        }

        if (section.type === "showcase") {
          return (
            <section key={i} className="border-b border-white/8 px-4 py-16">
              <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                  <Image
                    src={section.imageUrl}
                    alt={section.imageAlt ?? section.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 560px"
                    unoptimized
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold sm:text-3xl">{section.title}</h2>
                  <p className="mt-3 text-stone-400">{section.caption}</p>
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "features") {
          return (
            <section key={i} className="border-b border-white/8 px-4 py-16 sm:py-20">
              <div className="mx-auto max-w-5xl">
                <h2 className="text-center text-2xl font-bold sm:text-3xl">{section.title}</h2>
                <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                  {section.items.map((item, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.05 }}
                      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5 backdrop-blur-sm"
                    >
                      <span className="text-sm font-semibold" style={{ color: accent }}>
                        0{j + 1}
                      </span>
                      <p className="mt-2 font-medium leading-snug">{item}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </section>
          );
        }

        if (section.type === "pricing") {
          return (
            <section key={i} className="border-b border-white/8 px-4 py-16 sm:py-20">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-center text-2xl font-bold sm:text-3xl">{section.title}</h2>
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {section.plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`rounded-2xl border p-6 transition ${
                        plan.highlighted
                          ? "border-orange-500/40 bg-gradient-to-b from-orange-500/15 to-transparent shadow-xl"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                      style={
                        plan.highlighted
                          ? { boxShadow: `0 0 48px -16px ${accentGlow}` }
                          : undefined
                      }
                    >
                      <p className="text-sm font-semibold text-stone-400">{plan.name}</p>
                      <p className="mt-2 text-3xl font-bold">{plan.price}</p>
                      {plan.description ? (
                        <p className="mt-2 text-sm text-stone-500">{plan.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "cta") {
          return (
            <section key={i} className="px-4 py-20 sm:py-24">
              <div
                className="mx-auto max-w-2xl rounded-2xl border p-8 text-center sm:p-10"
                style={{
                  borderColor: accentSoft,
                  background: `linear-gradient(160deg, ${accentGlow}, transparent 55%)`,
                }}
              >
                <h2 className="text-2xl font-bold">{section.title}</h2>
                <p className="mt-3 text-stone-400">{section.subtitle}</p>
                <button
                  type="button"
                  className="mt-8 inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold text-white"
                  style={{ background: accent }}
                >
                  {section.button}
                </button>
              </div>
            </section>
          );
        }

        return null;
      })}
    </motion.div>
  );
}
