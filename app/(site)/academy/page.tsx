import { AcademyCatalog } from "@/components/academy/academy-catalog";
import { listPublishedCourses } from "@/lib/academy/courses";

export const metadata = {
  title: "Academy",
  description: "Learn to build, deploy, and sell on Mr.Software.",
};

export default async function AcademyPage() {
  const courses = await listPublishedCourses();
  return <AcademyCatalog courses={courses} />;
}
