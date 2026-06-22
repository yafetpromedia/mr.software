"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { parseJsonResponse } from "@/lib/http/parse-json-response";
import { DeploymentEditDialog } from "@/components/app/deployment-edit-dialog";
import type { ProjectRow } from "@/components/app/projects-table";

export function DeploymentDetailActions({ deployment }: { deployment: ProjectRow }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleDelete() {
    const ok = window.confirm(
      `Delete “${deployment.name}”? This removes the deployment and hosted files.`,
    );
    if (!ok) return;

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/deployments/${deployment.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      router.push("/projects");
      router.refresh();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Delete failed",
        ok: false,
      });
      setBusy(false);
    }
  }

  return (
    <>
      {message ? (
        <p
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => setEditOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40 disabled:opacity-50"
        >
          <Pencil className="h-4 w-4 text-[var(--accent)]" aria-hidden />
          Edit
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleDelete()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 text-sm font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete
        </button>
        <Link
          href="/deploy"
          className="inline-flex h-10 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          Redeploy
        </Link>
      </div>

      <DeploymentEditDialog
        deployment={deployment}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
