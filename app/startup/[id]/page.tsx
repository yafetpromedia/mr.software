import { notFound } from "next/navigation";
import { StartupLanding } from "@/components/startup/startup-landing";
import { getGeneratedStartupById } from "@/lib/startup/db";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const record = await getGeneratedStartupById(id);
  if (!record) return { title: "Startup not found" };
  return {
    title: `${record.payload.name} — Draft by Mr.Software`,
    description: record.payload.tagline,
  };
}

export default async function StartupLandingPage({ params }: Props) {
  const { id } = await params;
  const record = await getGeneratedStartupById(id);
  if (!record) notFound();

  return <StartupLanding payload={record.payload} startupId={record.id} />;
}
