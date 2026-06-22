import Link from "next/link";
import { notFound } from "next/navigation";
import { DeploymentDetailActions } from "@/components/app/deployment-detail-actions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const d = await prisma.deployment.findUnique({ where: { id }, select: { name: true } });
  if (!d) return { title: "Project" };
  return { title: d.name };
}

export default async function ProjectDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) return null;
  assertDeveloperPortalUser(session);

  const { id } = await params;
  const d = await prisma.deployment.findFirst({
    where: { id, userId: session.id },
  });

  if (!d) notFound();

  const statusClass =
    d.status === "ACTIVE"
      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
      : d.status === "FAILED"
        ? "bg-red-500/15 text-red-800 dark:text-red-300"
        : "bg-amber-500/15 text-amber-900 dark:text-amber-200";

  return (
    <div className="space-y-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--accent)]"
      >
        ← All projects
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">{d.name}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Created {new Date(d.createdAt).toLocaleString()}
          {d.framework ? ` · ${d.framework}` : ""}
        </p>
      </div>

      <DeploymentDetailActions
        deployment={{
          id: d.id,
          name: d.name,
          status: d.status,
          url: d.url,
          createdAt: d.createdAt,
          runtime: d.runtime,
          framework: d.framework,
        }}
      />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold ${statusClass}`}>
                {d.status}
              </span>
            </dd>
          </div>
          {d.url ? (
            <div>
              <dt className="text-[var(--muted)]">URL</dt>
              <dd className="mt-1">
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                >
                  Open site
                </a>
              </dd>
            </div>
          ) : null}
          {d.errorMessage ? (
            <div>
              <dt className="text-[var(--muted)]">Error</dt>
              <dd className="mt-1 whitespace-pre-wrap text-red-600 dark:text-red-400">{d.errorMessage}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  );
}
