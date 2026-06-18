"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Unplug,
  Zap,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";

type GithubRepo = {
  id: number;
  fullName: string;
  name: string;
  private: boolean;
  defaultBranch: string;
  htmlUrl: string;
  updatedAt: string;
  description: string | null;
};

type StatusResponse = {
  configured: boolean;
  connected: boolean;
  connection: { login: string; connectedAt: string } | null;
};

const ERROR_MESSAGES: Record<string, string> = {
  denied: "GitHub authorization was cancelled.",
  state: "Session expired. Try connecting again.",
  token: "Could not complete GitHub sign-in. Check your OAuth app settings.",
  user: "Could not read your GitHub profile.",
  config: "GitHub OAuth is not configured on this server.",
  db: "Could not save GitHub connection.",
  github: "GitHub returned an error.",
};

function WorkflowSteps() {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
      {["GitHub OAuth", "Select repo", "Download", "Deploy"].map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          {i > 0 ? <ArrowRight className="h-3 w-3 shrink-0 opacity-40" aria-hidden /> : null}
          <span className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 font-mono text-[0.65rem] text-[var(--foreground)]">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function DeployGithubPanel({ freeBlocked }: { freeBlocked: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [deployingId, setDeployingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/github/status", { credentials: "include" });
    if (!res.ok) return null;
    return (await res.json()) as StatusResponse;
  }, []);

  const loadRepos = useCallback(async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const res = await fetch("/api/github/repos", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load repos");
        return;
      }
      setRepos((data.repos as GithubRepo[]) ?? []);
    } catch {
      setError("Network error loading repositories.");
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await loadStatus();
        if (!cancelled && s) {
          setStatus(s);
          if (s.connected) await loadRepos();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadStatus, loadRepos]);

  useEffect(() => {
    const err = searchParams.get("github_error");
    if (err) {
      setError(ERROR_MESSAGES[err] ?? "GitHub connection failed.");
    }
    if (searchParams.get("github_connected") === "1") {
      setNotice("GitHub connected successfully.");
    }
  }, [searchParams]);

  async function handleDisconnect() {
    setError(null);
    const res = await fetch("/api/github/disconnect", {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      setError("Could not disconnect GitHub.");
      return;
    }
    setStatus({ configured: true, connected: false, connection: null });
    setRepos([]);
    setNotice(null);
  }

  async function handleDeploy(repo: GithubRepo) {
    if (freeBlocked || deployingId) return;
    setDeployingId(repo.id);
    setError(null);

    const [owner, repoName] = repo.fullName.split("/");
    if (!owner || !repoName) {
      setError("Invalid repository name.");
      setDeployingId(null);
      return;
    }

    try {
      const res = await fetch("/api/github/deploy", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo: repoName,
          branch: repo.defaultBranch,
          name: repo.name,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Deploy failed");
        return;
      }
      const id = data.deployment?.id as string | undefined;
      if (id) {
        router.push(`/projects/${id}`);
        router.refresh();
      }
    } catch {
      setError("Network error during deploy.");
    } finally {
      setDeployingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-[var(--muted)]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
        Loading GitHub…
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Deploy from GitHub</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Add your GitHub OAuth app credentials to enable repo deploys.
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium text-[var(--foreground)]">Server setup required</p>
          <p className="mt-1 text-[var(--muted)]">
            Set <code className="text-[var(--foreground)]">GITHUB_CLIENT_ID</code> and{" "}
            <code className="text-[var(--foreground)]">GITHUB_CLIENT_SECRET</code> in{" "}
            <code className="text-[var(--foreground)]">.env</code>, then restart the dev server.
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Callback URL:{" "}
            <code className="text-[var(--foreground)]">http://localhost:3000/api/github/callback</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Deploy from GitHub</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Connect your account, pick a repository, and Mr.Software deploys the static build. Auto-deploy
          on <code className="text-[var(--foreground)]">git push</code> ships next.
        </p>
        <div className="mt-3">
          <WorkflowSteps />
        </div>
      </div>

      {notice ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {!status.connected ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/50 p-6 text-center">
          <GithubIcon className="mx-auto h-10 w-10 text-[var(--foreground)]" />
          <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Connect GitHub</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Authorize Mr.Software to list repositories and deploy static sites.
          </p>
          <a
            href="/api/github/connect?next=%2Fdeploy%3Fsource%3Dgithub"
            className="btn-brand mt-4 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
          >
            <GithubIcon className="h-4 w-4" />
            Connect with GitHub
          </a>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)]/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
                <GithubIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  @{status.connection?.login}
                </p>
                <p className="text-xs text-[var(--muted)]">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadRepos()}
                disabled={loadingRepos}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-medium transition hover:bg-[var(--surface)] disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingRepos ? "animate-spin" : ""}`} aria-hidden />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => void handleDisconnect()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--muted)] transition hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500"
              >
                <Unplug className="h-3.5 w-3.5" aria-hidden />
                Disconnect
              </button>
            </div>
          </div>

          <ul className="space-y-2">
            {loadingRepos && repos.length === 0 ? (
              <li className="py-8 text-center text-sm text-[var(--muted)]">Loading repositories…</li>
            ) : repos.length === 0 ? (
              <li className="py-8 text-center text-sm text-[var(--muted)]">No repositories found.</li>
            ) : (
              repos.map((repo) => (
                <li
                  key={repo.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {repo.fullName}
                      </p>
                      {repo.private ? (
                        <span className="rounded-full bg-[var(--surface-elevated)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-[var(--muted)]">
                          Private
                        </span>
                      ) : null}
                    </div>
                    {repo.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{repo.description}</p>
                    ) : null}
                    <p className="mt-1 text-[0.65rem] text-[var(--muted)]">
                      Default branch: <code>{repo.defaultBranch}</code>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-[var(--border)] px-3 text-xs font-medium transition hover:bg-[var(--surface)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      View
                    </a>
                    <button
                      type="button"
                      disabled={freeBlocked || deployingId === repo.id}
                      onClick={() => void handleDeploy(repo)}
                      className="btn-brand inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold disabled:opacity-50"
                    >
                      {deployingId === repo.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          Deploying…
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5" aria-hidden />
                          Deploy
                        </>
                      )}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          <p className="text-xs text-[var(--muted)]">
            Static sites need <code className="text-[var(--foreground)]">index.html</code> in the repo.
            Framework builds (Next.js, Vite) and push-to-deploy webhooks are coming next.{" "}
            <Link href="/deploy?source=zip" className="font-medium text-[var(--accent)] hover:underline">
              Upload ZIP
            </Link>{" "}
            works today for any build output.
          </p>
        </>
      )}
    </div>
  );
}
