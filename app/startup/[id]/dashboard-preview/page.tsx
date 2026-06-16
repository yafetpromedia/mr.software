import { notFound } from "next/navigation";
import { StartupDashboardPreview } from "@/components/startup/startup-dashboard-preview";
import { getGeneratedStartupById } from "@/lib/startup/db";

type Props = { params: Promise<{ id: string }> };

export const metadata = {
  title: "Dashboard preview",
};

export default async function StartupDashboardPreviewPage({ params }: Props) {
  const { id } = await params;
  const record = await getGeneratedStartupById(id);
  if (!record) notFound();

  return <StartupDashboardPreview payload={record.payload} startupId={record.id} />;
}
