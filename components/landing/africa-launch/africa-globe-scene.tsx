"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import ThreeGlobe from "three-globe";
import * as THREE from "three";
import {
  AFRICA_ORANGE,
  COUNTRY_POINTS,
  DEPLOYMENT_ARCS,
  HUB,
  type DeploymentArc,
} from "@/lib/landing/africa-hero-data";
import { GLOBE_TEXTURES } from "@/lib/landing/africa-glow-dots";
import { GLOBE_RADIUS, latLngToVector3 } from "@/lib/landing/globe-math";
import type { TravelState } from "@/components/landing/africa-launch/use-cinematic-story";

/** Globe mesh sits lower; camera looks above it so the north pole clears the nav. */
const GLOBE_Y = -118;
const VIEW_FOCUS_Y = -76;
const CAMERA_DISTANCE = GLOBE_RADIUS * 1.82;

/** Pull camera back so you see a real spherical planet (Africa facing camera). */
function GlobeCamera({
  controlsRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const camPos = latLngToVector3(8, 20, CAMERA_DISTANCE);
    camPos.y += 30;
    camera.position.copy(camPos);
    camera.lookAt(0, VIEW_FOCUS_Y, 0);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(0, VIEW_FOCUS_Y, 0);
      controlsRef.current.update();
    }
  }, [camera, controlsRef]);

  return null;
}

type GlobeMeshProps = {
  activeArcCount: number;
  litCountries: number;
};

function EarthGlobe({ activeArcCount, litCountries }: GlobeMeshProps) {
  const globe = useMemo(() => {
    const g = new ThreeGlobe({ animateIn: false, waitForGlobeReady: true })
      .globeImageUrl(GLOBE_TEXTURES.globe)
      .bumpImageUrl(GLOBE_TEXTURES.bump)
      .showAtmosphere(true)
      .atmosphereColor(AFRICA_ORANGE)
      .atmosphereAltitude(0.26)
      .showGraticules(false)
      .arcsData([])
      .arcStartLat("startLat")
      .arcStartLng("startLng")
      .arcEndLat("endLat")
      .arcEndLng("endLng")
      .arcColor(() => [AFRICA_ORANGE, "rgba(255,122,26,0.12)"])
      .arcAltitude(0.25)
      .arcStroke(0.55)
      .arcDashLength(0.5)
      .arcDashGap(0.15)
      .arcDashAnimateTime(2200)
      .pointsData([])
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude("alt")
      .pointRadius("size")
      .pointColor((d: object) =>
        "hub" in d && (d as { hub?: boolean }).hub ? AFRICA_ORANGE : "#ffaa66",
      )
      .pointsMerge(false);

    const mat = g.globeMaterial();
    if (mat instanceof THREE.MeshPhongMaterial) {
      mat.emissive = new THREE.Color("#243852");
      mat.emissiveIntensity = 0.28;
      mat.shininess = 8;
    }

    return g;
  }, []);

  useEffect(() => {
    globe.arcsData(
      DEPLOYMENT_ARCS.slice(0, activeArcCount).map((a) => ({
        startLat: a.startLat,
        startLng: a.startLng,
        endLat: a.endLat,
        endLng: a.endLng,
      })),
    );

    globe.pointsData(
      COUNTRY_POINTS.slice(0, litCountries).map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        size: i === 0 ? 0.35 : 0.2,
        alt: i === 0 ? 0.04 : 0.02,
        hub: i === 0,
      })),
    );
  }, [activeArcCount, litCountries, globe]);

  return <primitive object={globe} />;
}

export type AfricaGlobeSceneProps = {
  activeArcCount: number;
  litCountries: number;
  reduceMotion: boolean;
  travel: TravelState | null;
  className?: string;
};

export function AfricaGlobeScene({
  activeArcCount,
  litCountries,
  reduceMotion,
  className,
}: AfricaGlobeSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 280], fov: 33 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.75]}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.38;
        }}
      >
        <ambientLight intensity={1.15} />
        <hemisphereLight args={["#4a6280", "#101018", 0.72]} />
        <directionalLight position={[90, 90, 110]} intensity={2.1} color="#ffffff" />
        <directionalLight position={[-70, 40, 80]} intensity={0.55} color="#ffe8d0" />
        <group position={[0, GLOBE_Y, 0]}>
          <pointLight
            position={latLngToVector3(HUB.lat, HUB.lng, GLOBE_RADIUS * 1.5)}
            intensity={1.05}
            color={AFRICA_ORANGE}
            distance={240}
          />
          <EarthGlobe activeArcCount={activeArcCount} litCountries={litCountries} />
        </group>
        <Stars radius={300} depth={50} count={1200} factor={2.5} saturation={0} fade speed={0.15} />
        <GlobeCamera controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={false}
          minDistance={CAMERA_DISTANCE - 15}
          maxDistance={CAMERA_DISTANCE + 20}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.85}
          rotateSpeed={0.45}
          autoRotate={!reduceMotion}
          autoRotateSpeed={0.25}
          enableDamping
          dampingFactor={0.06}
        />
      </Canvas>
    </div>
  );
}

export function arcsForPhase(count: number): DeploymentArc[] {
  return DEPLOYMENT_ARCS.slice(0, count);
}
