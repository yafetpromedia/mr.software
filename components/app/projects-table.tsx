"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Deployment, DeploymentStatus } from "@prisma/client";
import { parseJsonResponse } from "@/lib/http/parse-json-response";
import { DeploymentEditDialog } from "@/components/app/deployment-edit-dialog";

export type ProjectRow = Pick<
  Deployment,
  "id" | "name" | "status" | "url" | "createdAt" | "runtime" | "framework"
>;

type Props = {
  deployments: ProjectRow[];
};

function statusClass(status: DeploymentStatus): string {
  if (status === "ACTIVE") {
    return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
  }
  if (status === "FAILED") {
    return "bg-red-500/15 text-red-800 dark:text-red-300";
  }
  return "bg-amber-500/15 text-amber-900 dark:text-amber-200";
}

function displayUrl(url: string | null): { href: string; label: string } | null {
  if (!url) return null;
  const href = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  const label = url.replace(/^https?:\/\//, "");
  return { href, label: label.length > 48 ? `${label.slice(0, 45)}…` : label };
}

type MenuAnchor = {
  row: ProjectRow;
  top: number;
  left: number;
  openUp: boolean;
};

const MENU_EST_HEIGHT = 96;

export function ProjectsTable({ deployments: initialDeployments }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialDeployments);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const [edit, setEdit] = useState<ProjectRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuAnchor) return;
    function close() {
      setMenuAnchor(null);
    }
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menuAnchor]);

  function openMenu(row: ProjectRow, button: HTMLButtonElement) {
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < MENU_EST_HEIGHT + 12;
    setMenuAnchor({
      row,
      top: openUp ? rect.top - 8 : rect.bottom + 4,
      left: rect.right,
      openUp,
    });
  }

  function closeMenu() {
    setMenuAnchor(null);
  }

  function openEdit(row: ProjectRow) {
    closeMenu();
    setEdit(row);
  }

  async function deleteProject(row: ProjectRow) {
    closeMenu();
    const ok = window.confirm(`Delete “${row.name}”? This removes the deployment and hosted files.`);
    if (!ok) return;

    setBusyId(row.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/deployments/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setRows((r) => r.filter((x) => x.id !== row.id));
      setMessage({ text: "Project deleted", ok: true });
      router.refresh();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Delete failed",
        ok: false,
      });
    } finally {
      setBusyId(null);
    }
  }

  function handleSaved(updated: ProjectRow) {
    setRows((r) => r.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
    setMessage({ text: "Project updated", ok: true });
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
        No projects yet.{" "}
        <Link href="/deploy" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
          Deploy one
        </Link>
        .
      </p>
    );
  }

  return (
    <>
      {message ? (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
          }`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <th scope="col" className="px-4 py-3 pl-5">
                Project
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                URL
              </th>
              <th scope="col" className="px-4 py-3">
                Created
              </th>
              <th scope="col" className="px-4 py-3 pr-5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const u = displayUrl(d.url);
              const busy = busyId === d.id;
              return (
                <tr key={d.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 pl-5">
                    <div className="font-medium text-[var(--foreground)]">{d.name}</div>
                    {d.framework ? (
                      <div className="mt-0.5 text-xs text-[var(--muted)]">{d.framework}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusClass(d.status)}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="max-w-[12rem] px-4 py-3 text-[var(--muted)]">
                    {u ? (
                      <a
                        href={u.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-[var(--accent)] underline-offset-2 hover:underline"
                        title={d.url ?? ""}
                      >
                        {u.label}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">
                    {new Date(d.createdAt).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 pr-5 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      {u ? (
                        <a
                          href={u.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          Open
                        </a>
                      ) : null}
                      <Link
                        href={`/projects/${d.id}`}
                        className="inline-flex h-8 items-center rounded-lg bg-[var(--foreground)] px-2.5 text-xs font-semibold text-[var(--background)] transition hover:bg-[var(--accent)]"
                      >
                        Details
                      </Link>

                      <div className="relative">
                        <button
                          type="button"
                          disabled={busy}
                          aria-expanded={menuAnchor?.row.id === d.id}
                          aria-haspopup="menu"
                          onClick={(e) => {
                            if (menuAnchor?.row.id === d.id) {
                              closeMenu();
                            } else {
                              openMenu(d, e.currentTarget);
                            }
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)] disabled:opacity-50"
                          aria-label="Project actions"
                        >
                          <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {mounted && menuAnchor
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-0 z-[60] cursor-default bg-transparent"
                aria-label="Close menu"
                onClick={closeMenu}
              />
              <ul
                role="menu"
                className="fixed z-[70] min-w-[10.5rem] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
                style={{
                  top: menuAnchor.top,
                  left: menuAnchor.left,
                  transform: menuAnchor.openUp ? "translate(-100%, -100%)" : "translateX(-100%)",
                }}
              >
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => openEdit(menuAnchor.row)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--accent-muted)]/40"
                  >
                    <Pencil className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} />
                    Edit name
                  </button>
                </li>
                <li role="none" className="border-t border-[var(--border)]">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void deleteProject(menuAnchor.row)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    Delete project
                  </button>
                </li>
              </ul>
            </>,
            document.body,
          )
        : null}

      <DeploymentEditDialog
        deployment={edit}
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        onSaved={handleSaved}
      />
    </>
  );
}
