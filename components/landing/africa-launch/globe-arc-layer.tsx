"use client";

import { useEffect, useMemo } from "react";
import ThreeGlobe from "three-globe";
import * as THREE from "three";
import { DEPLOYMENT_ARCS, HUB } from "@/lib/landing/africa-hero-data";

const TRANSPARENT_GLOBE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

type Props = {
  showDetails: boolean;
  energyPulse: boolean;
};

/** Arcs, hub ring & markers — globe mesh hidden (dot earth renders underneath). */
export function GlobeArcLayer({ showDetails, energyPulse }: Props) {
  const globe = useMemo(() => {
    const g = new ThreeGlobe({ animateIn: false, waitForGlobeReady: true })
      .globeImageUrl(TRANSPARENT_GLOBE)
      .showAtmosphere(false)
      .showGraticules(false)
      .arcsData([])
      .arcStartLat("startLat")
      .arcStartLng("startLng")
      .arcEndLat("endLat")
      .arcEndLng("endLng")
      .arcColor(() => ["#FFB347", "#FF7A1A"])
      .arcAltitude(0.22)
      .arcStroke(0.55)
      .arcDashLength(0.45)
      .arcDashGap(0.15)
      .arcDashAnimateTime(1800)
      .pointsData([])
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude("alt")
      .pointRadius("size")
      .pointColor((d: object) =>
        "hub" in d && (d as { hub?: boolean }).hub ? "#FFD080" : "#FF7A1A",
      )
      .pointsMerge(false)
      .ringsData([])
      .ringLat("lat")
      .ringLng("lng")
      .ringColor(["#FF7A1A", "#3d1200"])
      .ringMaxRadius(2.8)
      .ringPropagationSpeed(1.4)
      .ringRepeatPeriod(1800);

    const mat = g.globeMaterial();
    if (mat instanceof THREE.MeshPhongMaterial) {
      mat.opacity = 0;
      mat.transparent = true;
      mat.depthWrite = false;
    }

    return g;
  }, []);

  useEffect(() => {
    globe.ringMaxRadius(energyPulse ? 4.2 : 2.8);
    globe.ringPropagationSpeed(energyPulse ? 2.2 : 1.4);
    globe.ringRepeatPeriod(energyPulse ? 1000 : 1800);
  }, [energyPulse, globe]);

  useEffect(() => {
    if (!showDetails) {
      globe.arcsData([]);
      globe.pointsData([]);
      globe.ringsData([]);
      return;
    }

    globe.ringsData([{ lat: HUB.lat, lng: HUB.lng }]);
    globe.arcsData(
      DEPLOYMENT_ARCS.slice(0, 2).map((a) => ({
        startLat: a.startLat,
        startLng: a.startLng,
        endLat: a.endLat,
        endLng: a.endLng,
      })),
    );

    globe.pointsData([
      { lat: HUB.lat, lng: HUB.lng, size: 0.28, alt: 0.04, hub: true },
      { lat: -1.292, lng: 36.822, size: 0.1, alt: 0.02, hub: false },
      { lat: 52.52, lng: 13.405, size: 0.1, alt: 0.02, hub: false },
    ]);
  }, [globe, showDetails]);

  return <primitive object={globe} />;
}
