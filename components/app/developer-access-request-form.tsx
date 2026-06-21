"use client";

import { useCallback, useEffect, useState } from "react";
import { Code2 } from "lucide-react";
import type { DeveloperAccessRequestView } from "@/lib/developer-access/types";
import { DEVELOPER_ACCESS_STATUS_LABEL } from "@/lib/developer-access/types";

export function DeveloperAccessRequestForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pitch, setPitch] = useState("");
  const [website, setWebsite] = useState("");
  const [canRequest, setCanRequest] = useState(false);
  const [request, setRequest] = useState<DeveloperAccessRequestView | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/developer-access", { credentials: "include" });
      const data = (await res.json()) as {
        error?: string;
        canRequest?: boolean;
        request?: DeveloperAccessRequestView | null;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setCanRequest(Boolean(data.canRequest));
      setRequest(data.request ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/developer-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pitch, website }),
      });
      const data = (await res.json()) as {
        error?: string;
        request?: DeveloperAccessRequestView;
      };
      if (!res.ok || !data.request) {
        throw new Error(data.error ?? "Submit failed");
      }
      setRequest(data.request);
      setCanRequest(false);
      setStatus("Request sent. An admin will review it — sign out and back in after approval.");
      setPitch("");
      setWebsite("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading…</p>;
  }

  if (request?.status === "APPROVED") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
        Your developer access was approved. Sign out and sign back in to open the developer workspace.
      </div>
    );
  }

  if (request?.status === "PENDING") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          <p className="font-semibold">Request pending review</p>
          <p className="mt-1 text-[var(--muted)]">
            Submitted {new Date(request.createdAt).toLocaleString()}. We&apos;ll notify you when an admin
            decides.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/50 p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Your pitch</p>
          <p className="mt-2 whitespace-pre-wrap text-[var(--foreground)]">{request.pitch}</p>
        </div>
      </div>
    );
  }

  if (request?.status === "REJECTED") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          <p className="font-semibold">
            Previous request {DEVELOPER_ACCESS_STATUS_LABEL.REJECTED.toLowerCase()}
          </p>
          {request.adminNote ? (
            <p className="mt-1">Admin note: {request.adminNote}</p>
          ) : (
            <p className="mt-1 text-[var(--muted)]">You can submit a new request below.</p>
          )}
        </div>
        {canRequest ? (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            {formFields()}
          </form>
        ) : null}
      </div>
    );
  }

  function formFields() {
    return (
      <>
        <div>
          <label htmlFor="dev-pitch" className="text-xs font-medium text-[var(--muted)]">
            What will you build or sell? *
          </label>
          <textarea
            id="dev-pitch"
            required
            rows={5}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Describe your products, experience, and why you need deploy + listing access…"
            className="mt-1 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="dev-website" className="text-xs font-medium text-[var(--muted)]">
            Portfolio or website (optional)
          </label>
          <input
            id="dev-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="github.com/you or yoursite.com"
            className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none ring-[var(--accent)]/30 focus:ring-2"
          />
        </div>
        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center rounded-xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Request developer access"}
        </button>
      </>
    );
  }

  if (!canRequest) {
    return <p className="text-sm text-[var(--muted)]">Developer access is not available for this account.</p>;
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--muted)]">
        Members can browse and buy software. Developers can deploy apps, create a storefront, and publish
        listings. Submit a short pitch — an admin will review and promote your account.
      </p>
      {formFields()}
    </form>
  );
}

export function DeveloperAccessSettingsIntro() {
  return (
    <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
      <Code2 className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
      Need deploy and listing tools? Request promotion here instead of emailing support.
    </p>
  );
}
