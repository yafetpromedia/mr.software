import { AcademyCatalog } from "@/components/academy/academy-catalog";
import { getPublicAcademySection } from "@/lib/academy/courses";

export const metadata = {
  title: "Academy",
  description: "Learn to build, deploy, and sell on Mr.Software.",
};

export default async function AcademyPage() {
  const { settings, courses } = await getPublicAcademySection();
  return <AcademyCatalog settings={settings} courses={courses} />;
}
