import Link from "next/link";
import { ProjectsTable } from "@/components/app/projects-table";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { assertDeveloperPortalUser } from "@/lib/auth/developer-portal-access";

export const metadata = {
  title: "Projects",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ProjectsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) return null;
  assertDeveloperPortalUser(session);
  const { q } = await searchParams;
  const qTrim = (q ?? "").trim();

  const deployments = await prisma.deployment.findMany({
    where: {
      userId: session.id,
      ...(qTrim
        ? { name: { contains: qTrim, mode: "insensitive" } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">Projects</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Deployments, URLs, and status—in a compact table (scroll on small screens).</p>
        </div>
        <Link
          href="/deploy"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-md shadow-[var(--accent-glow)] transition hover:bg-[var(--accent-hover)]"
        >
          New deployment
        </Link>
      </div>

      {qTrim ? (
        <p className="text-sm text-[var(--muted)]">
          Filter: “<span className="text-[var(--foreground)]">{qTrim}</span>” —{" "}
          <Link href="/projects" className="text-[var(--accent)] hover:underline">
            Clear
          </Link>
        </p>
      ) : null}

      {deployments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
          {qTrim
            ? "No projects match that search."
            : "No projects yet. "}
          {!qTrim ? (
            <>
              <Link href="/deploy" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
                Deploy one
              </Link>
              .
            </>
          ) : null}
        </p>
      ) : (
        <ProjectsTable deployments={deployments} />
      )}
    </div>
  );
}
