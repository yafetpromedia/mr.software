"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { PublicTestimonial } from "@/lib/testimonials";
import { FadeIn, LandingContainer, SectionLabel } from "@/components/landing/landing-ui";

function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `${value} out of 5 stars` : "Rate your experience"}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`rounded p-0.5 transition ${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <svg
            className={`h-4 w-4 sm:h-5 sm:w-5 ${
              star <= value
                ? "fill-[var(--accent)] text-[var(--accent)]"
                : "fill-transparent text-[var(--border)]"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

function TestimonialCard({ item }: { item: PublicTestimonial }) {
  const subtitle = [item.role, item.company].filter(Boolean).join(" · ");

  return (
    <figure className="group relative flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6 shadow-sm backdrop-blur-sm transition duration-300 hover:border-[var(--accent)]/25 hover:shadow-md dark:bg-zinc-900/40">
      <div
        className="pointer-events-none absolute right-5 top-4 font-serif text-5xl leading-none text-[var(--accent)]/15"
        aria-hidden
      >
        &ldquo;
      </div>
      {item.rating ? (
        <div className="mb-4">
          <StarRating value={item.rating} readOnly />
        </div>
      ) : null}
      <blockquote className="flex-1 text-sm leading-relaxed text-[var(--foreground)] sm:text-[0.95rem]">
        {item.quote}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-[var(--border)] pt-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)] font-display text-sm font-bold text-[var(--accent)]"
          aria-hidden
        >
          {item.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">{item.name}</p>
          {subtitle ? (
            <p className="truncate text-xs text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

function TestimonialSubmitDialog({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [quote, setQuote] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setError("");
      setSuccess(false);
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          company,
          quote,
          email,
          rating,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Submission failed");
      }
      setSuccess(true);
      onSubmitted();
      setTimeout(() => {
        setName("");
        setRole("");
        setCompany("");
        setQuote("");
        setEmail("");
        setRating(5);
        onClose();
      }, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="testimonial-dialog-title"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-4 bottom-4 top-auto z-[70] mx-auto max-h-[min(90dvh,40rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            {success ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Thank you!</h3>
                <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
                  Your story is in review. We&apos;ll publish it on the landing page once approved.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                      Share your story
                    </p>
                    <h3
                      id="testimonial-dialog-title"
                      className="mt-1 text-xl font-bold tracking-tight text-[var(--foreground)]"
                    >
                      Tell us about Mr.Software
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--accent-muted)] hover:text-[var(--foreground)]"
                    aria-label="Close"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)]">Your rating</label>
                    <div className="mt-1.5">
                      <StarRating value={rating} onChange={setRating} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="t-name" className="text-xs font-medium text-[var(--muted)]">
                        Name *
                      </label>
                      <input
                        id="t-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                        placeholder="Alex Chen"
                      />
                    </div>
                    <div>
                      <label htmlFor="t-role" className="text-xs font-medium text-[var(--muted)]">
                        Role
                      </label>
                      <input
                        id="t-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                        placeholder="Founder"
                      />
                    </div>
                    <div>
                      <label htmlFor="t-company" className="text-xs font-medium text-[var(--muted)]">
                        Company
                      </label>
                      <input
                        id="t-company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="t-quote" className="text-xs font-medium text-[var(--muted)]">
                        Your testimonial *
                      </label>
                      <textarea
                        id="t-quote"
                        required
                        rows={4}
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        className="mt-1 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                        placeholder="What changed for you after using the platform?"
                      />
                      <p className="mt-1 text-right text-[0.65rem] text-[var(--muted)]">
                        {quote.length}/600
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="t-email" className="text-xs font-medium text-[var(--muted)]">
                        Email (optional, not published)
                      </label>
                      <input
                        id="t-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  {error ? (
                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--foreground)] text-sm font-semibold text-[var(--background)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Submit for review"}
                  </button>
                  <p className="text-center text-[0.7rem] text-[var(--muted)]">
                    Submissions are reviewed before they appear on the site.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: PublicTestimonial[];
}) {
  const reduce = useReducedMotion();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section
      id="testimonials"
      className="relative scroll-mt-20 border-b border-[var(--border)] py-16 sm:py-20"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--surface)]/10 to-[var(--background)]"
        aria-hidden
      />
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-15 mix-blend-multiply dark:opacity-10" aria-hidden />

      <LandingContainer className="relative">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <SectionLabel>Testimonials</SectionLabel>
          <h2
            id="testimonials-heading"
            className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Loved by builders worldwide
          </h2>
          <p className="mt-3 text-sm text-[var(--muted)] sm:text-base">
            Real stories from teams shipping with Mr.Software — and you can add yours.
          </p>
        </FadeIn>

        {testimonials.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item, i) => (
              <motion.li
                key={item.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.06 }}
                className="h-full"
              >
                <TestimonialCard item={item} />
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 px-6 py-10 text-center">
            <p className="text-sm text-[var(--muted)]">
              Be the first to share your experience with Mr.Software.
            </p>
          </div>
        )}

        <motion.div
          className="mt-10 flex justify-center"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)]/40 hover:shadow-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)] transition group-hover:scale-105">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            Share your testimonial
          </button>
        </motion.div>
      </LandingContainer>

      <TestimonialSubmitDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmitted={() => {}}
      />
    </section>
  );
}
