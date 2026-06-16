"use client";

import Link from "next/link";
import { FadeIn, LandingContainer } from "@/components/landing/landing-ui";

export function LandingCtaBand() {
  return (
    <section className="border-t border-[var(--border)] py-20 sm:py-24">
      <LandingContainer>
        <FadeIn>
          <div className="cta-band relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-14">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,var(--accent-glow),transparent)]"
              aria-hidden
            />
            <h2 className="relative font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to draft your startup?
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-[var(--muted)] sm:text-base">
              Get AI-suggested structure and landing drafts in minutes — then edit, export, and
              deploy on your terms.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/app/builder"
                className="btn-brand inline-flex h-11 items-center justify-center rounded-lg px-7 text-sm font-semibold"
              >
                Try the builder
              </Link>
              <Link
                href="/marketplace"
                className="btn-ghost inline-flex h-11 items-center justify-center rounded-lg px-7 text-sm font-semibold"
              >
                Browse marketplace
              </Link>
            </div>
          </div>
        </FadeIn>
      </LandingContainer>
    </section>
  );
}
