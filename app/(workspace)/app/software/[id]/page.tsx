import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoftwareDetailView } from "@/components/software/software-detail-view";
import { getSoftwareById } from "@/lib/data/software";
import { getSession } from "@/lib/auth/session";
import { buildSoftwareDetailViewProps } from "@/lib/software/detail-page-props";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getSoftwareById(id);
  if (!item) return { title: "Not found" };
  return {
    title: item.name,
    description: item.shortDescription,
    openGraph: {
      images: [{ url: item.thumbnailUrl, width: 1200, height: 675, alt: item.name }],
    },
  };
}

export default async function WorkspaceSoftwareDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  const props = await buildSoftwareDetailViewProps(id, session);
  if (!props) notFound();

  return (
    <div className="relative -mx-4 min-h-[60vh] border border-[var(--border)]/60 border-t-0 bg-[var(--background)] sm:-mx-6 sm:mx-0 sm:rounded-2xl sm:border sm:border-t">
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <SoftwareDetailView {...props} variant="portal" />
      </div>
    </div>
  );
}
