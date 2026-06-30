"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { GLOBE_RADIUS } from "@/lib/landing/globe-math";

export type GlobeLayoutTier = "mobile" | "tablet" | "desktop" | "wide";

export type GlobeLayoutVariant = "hero" | "embedded";

export type GlobeSceneLayout = {
  tier: GlobeLayoutTier;
  globeY: number;
  viewFocus: THREE.Vector3;
  cameraDistance: number;
  fov: number;
};

const LAYOUTS: Record<GlobeLayoutTier, Omit<GlobeSceneLayout, "tier">> = {
  mobile: {
    globeY: 0,
    viewFocus: new THREE.Vector3(0, 0, 0),
    cameraDistance: GLOBE_RADIUS * 2.68,
    fov: 40,
  },
  tablet: {
    globeY: 0,
    viewFocus: new THREE.Vector3(0, 0, 0),
    cameraDistance: GLOBE_RADIUS * 2.58,
    fov: 41,
  },
  desktop: {
    globeY: 0,
    viewFocus: new THREE.Vector3(0, 0, 0),
    cameraDistance: GLOBE_RADIUS * 2.48,
    fov: 42,
  },
  wide: {
    globeY: 0,
    viewFocus: new THREE.Vector3(0, 0, 0),
    cameraDistance: GLOBE_RADIUS * 2.4,
    fov: 42,
  },
};

/** Centered framing for map page / card embeds (not full-viewport hero). */
const EMBEDDED_LAYOUTS: Record<GlobeLayoutTier, Omit<GlobeSceneLayout, "tier">> = {
  mobile: {
    globeY: 0,
    viewFocus: new THREE.Vector3(0, 0, 0),
    cameraDistance: GLOBE_RADIUS * 2.22,
    fov: 42,
  },
  tablet: {
    globeY: 0,
    viewFocus: new THREE.Vector3(0, 0, 0),
    cameraDistance: GLOBE_RADIUS * 2.16,
    fov: 43,
  },
  desktop: {
    globeY: 0,
    viewFocus: new THREE.Vector3(0, 0, 0),
    cameraDistance: GLOBE_RADIUS * 2.1,
    fov: 44,
  },
  wide: {
    globeY: 0,
    viewFocus: new THREE.Vector3(0, 0, 0),
    cameraDistance: GLOBE_RADIUS * 2.05,
    fov: 44,
  },
};

function tierFromWidth(width: number): GlobeLayoutTier {
  if (width >= 1280) return "wide";
  if (width >= 1024) return "desktop";
  if (width >= 640) return "tablet";
  return "mobile";
}

export function useGlobeLayout(variant: GlobeLayoutVariant = "hero"): GlobeSceneLayout {
  const [tier, setTier] = useState<GlobeLayoutTier>("mobile");

  useEffect(() => {
    const update = () => setTier(tierFromWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const layouts = variant === "embedded" ? EMBEDDED_LAYOUTS : LAYOUTS;
  return useMemo(() => ({ tier, ...layouts[tier] }), [tier, variant]);
}
