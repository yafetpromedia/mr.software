import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Software",
  description: "Catalog listings",
};

export default async function AdminSoftwarePage() {
  const items = await prisma.software.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      price: true,
      pricingModel: true,
      createdAt: true,
      developer: { select: { id: true, email: true, name: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Software
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
          Marketplace listings, developer, and public storefront links.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm dark:bg-[var(--surface-elevated)]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              <th className="px-4 py-3 sm:px-5">Listing</th>
              <th className="px-4 py-3 sm:px-5">Developer</th>
              <th className="px-4 py-3 sm:px-5">Price</th>
              <th className="px-4 py-3 sm:px-5">Model</th>
              <th className="px-4 py-3 sm:px-5">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-[var(--muted)] sm:px-5"
                >
                  No software yet.
                </td>
              </tr>
            ) : (
              items.map((s) => (
                <tr
                  key={s.id}
                  className="bg-[var(--surface)] transition-colors hover:bg-[var(--accent-muted)]/30 dark:bg-[var(--surface-elevated)] dark:hover:bg-[var(--accent-muted)]/20"
                >
                  <td className="px-4 py-3 sm:px-5">
                    <Link
                      href={`/software/${s.id}`}
                      className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                    >
                      {s.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-[0.65rem] text-[var(--muted)]">
                      {s.id}
                    </p>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <p className="text-[var(--foreground)]">{s.developer.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {s.developer.email}
                    </p>
                    <Link
                      href={`/admin/users?q=${encodeURIComponent(s.developer.email)}`}
                      className="mt-1 inline-block text-xs font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                    >
                      Open in Users
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums text-[var(--foreground)] sm:px-5">
                    {s.price}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] sm:px-5">
                    {s.pricingModel}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] sm:px-5">
                    {s.createdAt.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
