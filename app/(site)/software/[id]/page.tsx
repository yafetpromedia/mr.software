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

export default async function SoftwareDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  const props = await buildSoftwareDetailViewProps(id, session);
  if (!props) notFound();

  return <SoftwareDetailView {...props} variant="catalog" />;
}
