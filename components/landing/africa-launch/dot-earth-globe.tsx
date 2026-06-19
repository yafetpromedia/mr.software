"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLOBE_TEXTURES } from "@/lib/landing/africa-glow-dots";
import { createDotGlobeMaterial } from "@/lib/landing/globe-dot-shader";
import { GLOBE_RADIUS } from "@/lib/landing/globe-math";

type Props = {
  energyPulse?: boolean;
  onReady?: () => void;
};

export function DotEarthGlobe({ energyPulse = false, onReady }: Props) {
  const readyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const [dayMap, nightMap, bumpMap] = useLoader(THREE.TextureLoader, [
    GLOBE_TEXTURES.day,
    GLOBE_TEXTURES.night,
    GLOBE_TEXTURES.bump,
  ]);

  const material = useMemo(
    () => createDotGlobeMaterial(dayMap, nightMap, bumpMap),
    [dayMap, nightMap, bumpMap],
  );

  useEffect(() => {
    readyRef.current = false;
    if (dayMap.image && nightMap.image && bumpMap.image) {
      readyRef.current = true;
      onReadyRef.current?.();
    }
  }, [dayMap, nightMap, bumpMap]);

  useFrame(({ clock, camera }) => {
    material.uniforms.uTime!.value = clock.elapsedTime;
    material.uniforms.uEnergyPulse!.value = energyPulse ? 1 : 0;
    material.uniforms.uCameraPosition!.value.copy(camera.position);
  });

  return (
    <mesh material={material} renderOrder={1}>
      <sphereGeometry args={[GLOBE_RADIUS, 128, 128]} />
    </mesh>
  );
}
