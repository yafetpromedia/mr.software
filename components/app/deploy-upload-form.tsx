"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileArchive, Upload } from "lucide-react";

type Props = {
  defaultName?: string;
  softwareId?: string;
  onSuccess?: (deployment: { id: string }) => void;
  redirectOnSuccess?: boolean;
};

export function DeployUploadForm({
  defaultName = "",
  softwareId,
  onSuccess,
  redirectOnSuccess = true,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(defaultName);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultName) setName(defaultName);
  }, [defaultName]);

  const pickFile = useCallback((next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    if (!next.name.toLowerCase().endsWith(".zip")) {
      setError("Only .zip archives are allowed");
      return;
    }
    setError(null);
    setFile(next);
  }, []);

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
      if (softwareId) form.set("softwareId", softwareId);

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

      setProgress("Deployed successfully.");
      if (data.deployment?.id) {
        onSuccess?.({ id: data.deployment.id });
        if (redirectOnSuccess) {
          router.push(`/projects/${data.deployment.id}`);
          router.refresh();
        }
      } else if (redirectOnSuccess) {
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
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
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
        <span className="block text-sm font-medium text-[var(--foreground)]">ZIP archive (max 50 MB)</span>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFile(e.dataTransfer.files[0] ?? null);
          }}
          onClick={() => inputRef.current?.click()}
          className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragOver
              ? "border-[var(--accent)] bg-[var(--accent-muted)]/30"
              : file
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-[var(--border)] bg-[var(--background)]/60 hover:border-[var(--accent)]/40 hover:bg-[var(--accent-muted)]/10"
          }`}
        >
          {file ? (
            <>
              <FileArchive className="h-8 w-8 text-[var(--accent)]" aria-hidden />
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{file.name}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {(file.size / (1024 * 1024)).toFixed(2)} MB · click to replace
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-[var(--muted)]" aria-hidden />
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                Drag &amp; drop your ZIP here
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">or click to browse</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          id="zip"
          type="file"
          accept=".zip,application/zip"
          className="sr-only"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
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

      {progress ? <p className="text-sm text-[var(--muted)]">{progress}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="btn-brand inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-60 sm:w-auto sm:min-w-[10rem] sm:px-8"
      >
        {busy ? "Deploying…" : "Deploy to Mr.Software Cloud"}
      </button>
    </form>
  );
}
