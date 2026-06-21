import { LaunchMapExplore } from "@/components/launch-map/launch-map-explore";
import { getLaunchMapPayload } from "@/lib/launch-map/launch-map";

export const metadata = {
  title: "Global launch map",
  description: "Live deployments and marketplace activity from African builders on Mr.Software.",
};

export default async function ExploreMapPage() {
  const initialLaunchMap = await getLaunchMapPayload();

  return <LaunchMapExplore initialLaunchMap={initialLaunchMap} />;
}
