import { LaunchMapExplore } from "@/components/launch-map/launch-map-explore";
import { getLaunchMapPayload } from "@/lib/launch-map/launch-map";
import { BRAND_NAME } from "@/lib/branding/constants";

export const metadata = {
  title: "Global launch map",
  description: `Live deployments and marketplace activity from builders on ${BRAND_NAME}.`,
};

export default async function ExploreMapPage() {
  const initialLaunchMap = await getLaunchMapPayload();

  return <LaunchMapExplore initialLaunchMap={initialLaunchMap} />;
}
