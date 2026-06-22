"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { parseJsonResponse } from "@/lib/http/parse-json-response";
import type { ProjectRow } from "@/components/app/projects-table";

export function DeploymentEditDialog({
  deployment,
  open,
  onClose,
  onSaved,
}: {
  deployment: ProjectRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: ProjectRow) => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deployment) {
      setName(deployment.name);
      setError(null);
    }
  }, [deployment]);

  if (!open || !deployment) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deployment) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/deployments/${deployment.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await parseJsonResponse<{ deployment?: ProjectRow; error?: string }>(res);
      if (!res.ok || !data.deployment) {
        throw new Error(data.error ?? "Update failed");
      }
      onSaved(data.deployment);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-deployment-title"
        className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="edit-deployment-title" className="text-lg font-semibold text-[var(--foreground)]">
            Edit project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Project name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/30 focus:ring-2"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
