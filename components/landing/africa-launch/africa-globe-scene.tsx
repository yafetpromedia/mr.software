"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { AFRICA_VIEW, latLngToVector3 } from "@/lib/landing/globe-math";
import type { DeploymentArc } from "@/lib/landing/africa-hero-data";
import { AfricaGlobeSpin } from "@/components/landing/africa-launch/africa-locked-spin";
import { RealEarthGlobe } from "@/components/landing/africa-launch/real-earth-globe";
import { GlobeArcFlow } from "@/components/landing/africa-launch/globe-arc-flow";
import { GlobeViewportSync } from "@/components/landing/africa-launch/globe-viewport-sync";
import { useGlobeLayout, type GlobeLayoutVariant, type GlobeSceneLayout } from "@/components/landing/africa-launch/use-globe-layout";
import type { Group } from "three";

const AUTO_ROTATE_DELAY_MS = 1800;

function cameraPositionForAfrica(layout: Pick<GlobeSceneLayout, "viewFocus" | "cameraDistance">): THREE.Vector3 {
  return latLngToVector3(AFRICA_VIEW.lat, AFRICA_VIEW.lng, layout.cameraDistance).add(layout.viewFocus);
}

function GlobeCamera({
  controlsRef,
  layout,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  layout: GlobeSceneLayout;
}) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    const camPos = cameraPositionForAfrica(layout);
    camera.position.copy(camPos);
    camera.lookAt(layout.viewFocus);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = layout.fov;
    }
    camera.updateProjectionMatrix();

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(layout.viewFocus);
      controls.object.position.copy(camPos);
      controls.update();
    }
  }, [camera, controlsRef, layout.tier, layout.fov, layout.viewFocus, layout.cameraDistance]);

  return null;
}

function GlobeTone({ isLight }: { isLight: boolean }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = isLight ? 1.2 : 1.48;
  }, [gl, isLight]);
  return null;
}

export type AfricaGlobeSceneProps = {
  reduceMotion: boolean;
  isLight?: boolean;
  energyPulse?: boolean;
  introComplete?: boolean;
  onReady?: () => void;
  className?: string;
  deploymentArcs?: DeploymentArc[];
  variant?: GlobeLayoutVariant;
};

export function AfricaGlobeScene({
  reduceMotion,
  isLight = false,
  energyPulse = false,
  introComplete = true,
  onReady,
  className,
  deploymentArcs,
  variant = "hero",
}: AfricaGlobeSceneProps) {
  const layout = useGlobeLayout(variant);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const globeGroupRef = useRef<Group | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [isLight]);

  useEffect(() => {
    setSpinning(false);
    const delay = introComplete && !reduceMotion ? AUTO_ROTATE_DELAY_MS + 2200 : AUTO_ROTATE_DELAY_MS;
    const spinTimer = window.setTimeout(() => {
      if (!reduceMotion) setSpinning(true);
    }, delay);
    return () => window.clearTimeout(spinTimer);
  }, [introComplete, reduceMotion]);

  const handleGlobeReady = () => {
    setLoaded(true);
    onReady?.();
  };

  const initialCam = useMemo(() => cameraPositionForAfrica(layout), [layout.tier, layout.viewFocus, layout.cameraDistance]);
  const viewportKey = `${loaded}-${introComplete}-${layout.tier}-${variant}`;

  return (
    <div
      className={`africa-globe-canvas-root africa-globe-canvas-root--${layout.tier}${variant === "embedded" ? " africa-globe-canvas-root--embedded" : ""} ${isLight ? "africa-globe-canvas-root--light" : ""} ${loaded && introComplete ? "africa-globe-canvas-root--ready" : "africa-globe-canvas-root--loading"} ${className ?? ""}`}
    >
      <Canvas
        camera={{ position: initialCam.toArray(), fov: layout.fov }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.75]}
        style={{ width: "100%", height: "100%", background: "transparent", touchAction: "none" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = isLight ? 1.2 : 1.48;
        }}
      >
        <GlobeViewportSync refreshKey={viewportKey} />
        <GlobeTone isLight={isLight} />
        <ambientLight intensity={isLight ? 0.52 : 0.1} />
        <hemisphereLight
          args={isLight ? ["#e0f0ff", "#94a3b8", 0.58] : ["#1a2030", "#000000", 0.22]}
        />
        <directionalLight
          position={[130, 110, 95]}
          intensity={isLight ? 1.38 : 0.28}
          color={isLight ? "#fffaf5" : "#c8d8f0"}
        />
        <group ref={globeGroupRef} position={[0, layout.globeY, 0]}>
          <RealEarthGlobe
            isLight={isLight}
            energyPulse={energyPulse}
            showDetails={loaded && introComplete}
            onReady={handleGlobeReady}
          />
          <GlobeArcFlow
            show={loaded && introComplete}
            reduceMotion={!!reduceMotion}
            isLight={isLight}
            arcs={deploymentArcs}
          />
        </group>
        {!isLight ? (
          <Stars radius={260} depth={48} count={500} factor={1.8} saturation={0} fade speed={0.05} />
        ) : null}
        <GlobeCamera controlsRef={controlsRef} layout={layout} />
        <AfricaGlobeSpin
          globeGroupRef={globeGroupRef}
          controlsRef={controlsRef}
          spinning={spinning && !reduceMotion}
          dragging={dragging}
          isLight={isLight}
        />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={false}
          minDistance={layout.cameraDistance - 12}
          maxDistance={layout.cameraDistance + 16}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.9}
          rotateSpeed={0.55}
          autoRotate={false}
          enableDamping
          dampingFactor={0.08}
          onStart={() => {
            setDragging(true);
            setSpinning(false);
          }}
          onEnd={() => {
            setDragging(false);
            if (!reduceMotion) {
              window.setTimeout(() => setSpinning(true), 4000);
            }
          }}
        />
      </Canvas>
    </div>
  );
}
