"use client";

import { useState } from "react";
import { Cloud, ExternalLink, Loader2, Rocket } from "lucide-react";
import { parseJsonResponse } from "@/lib/http/parse-json-response";

type Props = {
  startupId: string;
  projectName?: string;
  disabled?: boolean;
  onSuccess?: (deployment: { id: string; url?: string | null }) => void;
};

export function StartupOneClickDeploy({
  startupId,
  projectName,
  disabled,
  onSuccess,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; url: string | null; name: string } | null>(
    null,
  );

  async function handleDeploy() {
    if (disabled || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/startup/${startupId}/deploy`, {
        method: "POST",
        credentials: "include",
      });
      const data = await parseJsonResponse<{
        deployment?: { id: string; url: string | null; name: string };
        error?: string;
      }>(res);
      if (!res.ok || !data.deployment) {
        throw new Error(data.error ?? "Deploy failed");
      }
      setResult({
        id: data.deployment.id,
        url: data.deployment.url,
        name: data.deployment.name,
      });
      onSuccess?.(data.deployment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deploy failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-muted)]/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Rocket className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            One-click deploy
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            Package your AI landing page as a static site and host it on Mr.Software Cloud — no ZIP
            required.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled || busy || Boolean(result)}
          onClick={() => void handleDeploy()}
          className="btn-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Deploying…
            </>
          ) : result ? (
            <>
              <Cloud className="h-4 w-4" aria-hidden />
              Deployed
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4" aria-hidden />
              Deploy {projectName ? `“${projectName}”` : "now"}
            </>
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {result?.url ? (
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Open live URL
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
