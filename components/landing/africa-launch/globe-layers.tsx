"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  AFRICA_ORANGE,
  DEPLOYMENT_ARCS,
  HUB,
  ORBIT_PRODUCTS,
} from "@/lib/landing/africa-hero-data";
import { GLOBE_RADIUS, interpolateArc, latLngToVector3 } from "@/lib/landing/globe-math";
import type { TravelState } from "@/components/landing/africa-launch/use-cinematic-story";

const HUB_PARTICLE_GEOMETRY = (() => {
  const geo = new THREE.BufferGeometry();
  const count = 48;
  const arr = new Float32Array(count * 3);
  const hub = latLngToVector3(HUB.lat, HUB.lng, GLOBE_RADIUS);
  for (let i = 0; i < count; i++) {
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 22,
    );
    const p = hub.clone().add(offset);
    arr[i * 3] = p.x;
    arr[i * 3 + 1] = p.y;
    arr[i * 3 + 2] = p.z;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  return geo;
})();

export function HubPulse({ reduceMotion }: { reduceMotion: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const pos = latLngToVector3(HUB.lat, HUB.lng, GLOBE_RADIUS * 1.01);

  useFrame(({ clock }) => {
    if (reduceMotion) return;
    const t = clock.elapsedTime;
    const pulse = 0.65 + Math.sin(t * 2.2) * 0.35;
    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.9 + pulse * 0.5);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 2.2) * 0.25;
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1.2 + Math.sin(t * 1.6) * 0.8);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 1.6) * 0.08;
    }
  });

  return (
    <group position={pos}>
      <mesh ref={ringRef}>
        <sphereGeometry args={[4.2, 24, 24]} />
        <meshBasicMaterial color={AFRICA_ORANGE} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[3.2, 24, 24]} />
        <meshBasicMaterial color={AFRICA_ORANGE} transparent opacity={0.85} />
      </mesh>
      <pointLight color={AFRICA_ORANGE} intensity={4} distance={120} />
      <Html center distanceFactor={180} style={{ pointerEvents: "none" }}>
        <div className="whitespace-nowrap text-center">
          <p className="text-[9px] font-semibold tracking-widest text-orange-200/90 uppercase">
            {HUB.label}
          </p>
          <p className="text-lg leading-none">{HUB.flag}</p>
        </div>
      </Html>
    </group>
  );
}

export function HubParticles({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (reduceMotion || !ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.15;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.35 + Math.sin(clock.elapsedTime * 1.8) * 0.15;
  });

  return (
    <points ref={ref} geometry={HUB_PARTICLE_GEOMETRY}>
      <pointsMaterial color={AFRICA_ORANGE} size={1.4} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

export function ArcTraveler({
  travel,
  reduceMotion,
}: {
  travel: TravelState | null;
  reduceMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!travel || !groupRef.current || reduceMotion) return;
    const arc = DEPLOYMENT_ARCS.find((a) => a.id === travel.arcId);
    if (!arc) return;
    const pos = interpolateArc(
      arc.startLat,
      arc.startLng,
      arc.endLat,
      arc.endLng,
      travel.progress,
      0.32,
    );
    groupRef.current.position.copy(pos);
    groupRef.current.lookAt(0, 0, 0);
  });

  if (!travel || travel.progress <= 0.01) return null;

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshBasicMaterial color={AFRICA_ORANGE} />
      </mesh>
      <pointLight color={AFRICA_ORANGE} intensity={1.8} distance={40} />
      <Html center distanceFactor={200} style={{ pointerEvents: "none" }}>
        <div className="africa-travel-card">
          {travel.arrived ? (
            <>
              <span className="text-[10px] text-emerald-300">✓ New Customer</span>
              <p className="font-display text-xs font-bold text-white">{travel.product}</p>
              <p className="text-[10px] text-white/50">
                {travel.endFlag} {travel.endLabel}
              </p>
            </>
          ) : (
            <>
              <span className="text-sm">🚀</span>
              <p className="font-display text-xs font-bold text-white">{travel.product}</p>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

export function ProductSatellites({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      {ORBIT_PRODUCTS.map((p) => (
        <Satellite key={p.id} name={p.name} speed={p.speed} phase={p.phase} reduceMotion={reduceMotion} />
      ))}
    </>
  );
}

function Satellite({
  name,
  speed,
  phase,
  reduceMotion,
}: {
  name: string;
  speed: number;
  phase: number;
  reduceMotion: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const orbitR = GLOBE_RADIUS * 1.38;

  useFrame(({ clock }) => {
    if (!ref.current || reduceMotion) return;
    const t = clock.elapsedTime * speed + phase;
    ref.current.position.set(
      Math.cos(t) * orbitR,
      Math.sin(t * 0.65) * orbitR * 0.22,
      Math.sin(t) * orbitR,
    );
    ref.current.lookAt(0, 0, 0);
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshBasicMaterial color={AFRICA_ORANGE} wireframe />
      </mesh>
      <Html center distanceFactor={220} style={{ pointerEvents: "none" }} occlude>
        <div className="africa-orbit-chip hidden md:block">{name}</div>
      </Html>
    </group>
  );
}

export function CosmicNebula() {
  return (
    <mesh position={[0, 0, -280]} renderOrder={-1}>
      <planeGeometry args={[900, 900]} />
      <meshBasicMaterial
        color="#FF7A1A"
        transparent
        opacity={0.04}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
