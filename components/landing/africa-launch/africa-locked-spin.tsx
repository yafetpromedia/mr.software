"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const SPIN_SPEED = 0.1;

type Props = {
  globeGroupRef: React.RefObject<Group | null>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  spinning: boolean;
  dragging: boolean;
  isLight: boolean;
};

/** Auto-spin the globe mesh; camera orbits freely while the user drags. */
export function AfricaGlobeSpin({
  globeGroupRef,
  controlsRef,
  spinning,
  dragging,
  isLight,
}: Props) {
  const lockedAzimuth = useRef<number | null>(null);
  const lockedPolar = useRef<number | null>(null);

  useEffect(() => {
    if (globeGroupRef.current) globeGroupRef.current.rotation.y = 0;
    lockedAzimuth.current = null;
    lockedPolar.current = null;
  }, [globeGroupRef, isLight]);

  useEffect(() => {
    if (spinning) {
      lockedAzimuth.current = null;
      lockedPolar.current = null;
    }
  }, [spinning]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (dragging || !spinning) {
      lockedAzimuth.current = null;
      lockedPolar.current = null;
      return;
    }

    if (lockedAzimuth.current === null || lockedPolar.current === null) {
      lockedAzimuth.current = controls.getAzimuthalAngle();
      lockedPolar.current = controls.getPolarAngle();
    }

    controls.setAzimuthalAngle(lockedAzimuth.current);
    controls.setPolarAngle(lockedPolar.current);
    controls.update();

    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * SPIN_SPEED;
    }
  });

  return null;
}
