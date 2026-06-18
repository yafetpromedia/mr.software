"use client";

import { useEffect, useMemo, useRef } from "react";
import ThreeGlobe from "three-globe";
import * as THREE from "three";
import { HUB } from "@/lib/landing/africa-hero-data";
import { getGlobeTextures } from "@/lib/landing/africa-glow-dots";

type Props = {
  isLight: boolean;
  energyPulse: boolean;
  showDetails: boolean;
  onReady: () => void;
};

const nightLoader = new THREE.TextureLoader();
let nightTexture: THREE.Texture | null = null;

function getNightTexture() {
  if (!nightTexture) {
    nightTexture = nightLoader.load(getGlobeTextures(false).night);
    nightTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return nightTexture;
}

function applyGlobeMaterial(mat: THREE.Material, isLight: boolean) {
  if (!(mat instanceof THREE.MeshPhongMaterial)) return;

  mat.bumpScale = isLight ? 0.72 : 0.85;
  mat.shininess = isLight ? 32 : 18;
  mat.specular = new THREE.Color(isLight ? "#c8dcf5" : "#ffaa66");

  if (isLight) {
    mat.color = new THREE.Color("#ffffff");
    mat.emissive = new THREE.Color("#000000");
    mat.emissiveIntensity = 0;
    mat.emissiveMap = null;
  } else {
    mat.color = new THREE.Color("#5c5348");
    mat.emissive = new THREE.Color("#ffc898");
    mat.emissiveMap = getNightTexture();
    mat.emissiveIntensity = 0.68;
  }

  mat.needsUpdate = true;
}

/** Photorealistic Earth — energy trails rendered separately in GlobeArcFlow. */
export function RealEarthGlobe({ isLight, energyPulse, showDetails, onReady }: Props) {
  const readyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const textures = getGlobeTextures(isLight);

  const globe = useMemo(() => {
    const g = new ThreeGlobe({ animateIn: false, waitForGlobeReady: true })
      .globeImageUrl(textures.globe)
      .bumpImageUrl(textures.bump)
      .showAtmosphere(isLight)
      .atmosphereColor(isLight ? "#b8d4f0" : "#000000")
      .atmosphereAltitude(isLight ? 0.14 : 0)
      .showGraticules(false)
      .arcsData([])
      .pointsData([])
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude("alt")
      .pointRadius("size")
      .pointColor((d: object) =>
        "hub" in d && (d as { hub?: boolean }).hub ? "#FF7A1A" : "#ffd080",
      )
      .pointsMerge(false)
      .ringsData([])
      .onGlobeReady(() => {
        applyGlobeMaterial(g.globeMaterial(), isLight);
        if (readyRef.current) return;
        readyRef.current = true;
        onReadyRef.current();
      });

    applyGlobeMaterial(g.globeMaterial(), isLight);
    return g;
  }, [isLight, textures.bump, textures.globe]);

  useEffect(() => {
    readyRef.current = false;
    applyGlobeMaterial(globe.globeMaterial(), isLight);
  }, [globe, isLight]);

  useEffect(() => {
    const mat = globe.globeMaterial();
    if (mat instanceof THREE.MeshPhongMaterial && isLight) {
      mat.color = new THREE.Color(energyPulse ? "#fafcff" : "#ffffff");
    } else if (mat instanceof THREE.MeshPhongMaterial && !isLight) {
      mat.emissiveIntensity = energyPulse ? 0.82 : 0.68;
      mat.color = new THREE.Color(energyPulse ? "#635850" : "#5c5348");
    }
    globe.showAtmosphere(isLight);
    if (isLight) {
      globe.atmosphereColor("#b8d4f0");
      globe.atmosphereAltitude(energyPulse ? 0.16 : 0.14);
    }
  }, [energyPulse, globe, isLight]);

  useEffect(() => {
    if (!showDetails) {
      globe.pointsData([]);
      return;
    }

    globe.pointsData([{ lat: HUB.lat, lng: HUB.lng, size: 0.14, alt: 0.018, hub: true }]);
  }, [globe, showDetails]);

  return <primitive object={globe} />;
}
