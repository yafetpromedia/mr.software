"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeployUploadForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose a .zip file");
      return;
    }
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setBusy(true);
    setProgress("Uploading and processing…");

    try {
      const form = new FormData();
      form.set("name", name.trim());
      form.set("file", file);

      const res = await fetch("/api/deploy", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const data = (await res.json()) as { error?: string; deployment?: { id: string } };

      if (!res.ok) {
        setError(data.error ?? "Deployment failed");
        setProgress(null);
        setBusy(false);
        return;
      }

      setProgress("Done.");
      if (data.deployment?.id) {
        router.push(`/projects/${data.deployment.id}`);
        router.refresh();
      } else {
        router.push("/projects");
      }
    } catch {
      setError("Network error");
      setProgress(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-[var(--foreground)]">
          Project name
        </label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)]/30 focus:ring-2"
          placeholder="My static site"
          maxLength={120}
          required
        />
      </div>

      <div>
        <label htmlFor="zip" className="block text-sm font-medium text-[var(--foreground)]">
          ZIP archive (max 50 MB)
        </label>
        <input
          id="zip"
          type="file"
          accept=".zip,application/zip"
          className="mt-2 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p className="mt-2 text-xs text-[var(--muted)]">
          Must contain <code className="text-[var(--foreground)]">index.html</code> somewhere in the tree.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {progress ? (
        <p className="text-sm text-[var(--muted)]">{progress}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-8 text-sm font-semibold text-white shadow-md shadow-[var(--accent-glow)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        {busy ? "Working…" : "Deploy"}
      </button>
    </form>
  );
}
