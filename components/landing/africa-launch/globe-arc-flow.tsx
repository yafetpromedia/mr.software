"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  DEPLOYMENT_ARCS,
  HUB,
  type DeploymentArc,
  ARC_ALTITUDE,
  ARC_TRAIL_LENGTH,
} from "@/lib/landing/africa-hero-data";
import { arcHeadProgress } from "@/lib/landing/globe-arc-timing";
import { arcTangent, hubSurfacePoint, interpolateArc, sampleArc } from "@/lib/landing/globe-math";

const UP = new THREE.Vector3(0, 1, 0);
const _quat = new THREE.Quaternion();
const TRAIL_SEGMENTS = 28;

function makeArrowHeadGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1.85);
  shape.lineTo(-0.85, -0.25);
  shape.lineTo(0, 0.15);
  shape.lineTo(0.85, -0.25);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: false });
  geo.center();
  return geo;
}

const ARROW_GEOMETRY = makeArrowHeadGeometry();

function orientAlongTangent(group: THREE.Group, tangent: THREE.Vector3) {
  _quat.setFromUnitVectors(UP, tangent);
  group.quaternion.copy(_quat);
}

function replaceTube(mesh: THREE.Mesh, curve: THREE.CatmullRomCurve3, radius: number) {
  if (curve.points.length < 2) return;
  const tubular = Math.max(8, curve.points.length * 2);
  const next = new THREE.TubeGeometry(curve, tubular, radius, 5, false);
  mesh.geometry.dispose();
  mesh.geometry = next;
}

function EthiopiaHubSpark({
  reduceMotion,
  isLight,
}: {
  reduceMotion: boolean;
  isLight: boolean;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => hubSurfacePoint(HUB.lat, HUB.lng, 1.008), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pulse = reduceMotion ? 1 : 0.88 + Math.sin(t * 1.8) * 0.12;
    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse);
      (coreRef.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + pulse * 0.2;
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(1.1 + Math.sin(t * 1.4) * 0.15);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(t * 1.4) * 0.04;
    }
  });

  return (
    <group position={pos} renderOrder={13}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[2.2, 12, 12]} />
        <meshBasicMaterial
          color={isLight ? "#FF9A4D" : "#FF9A4D"}
          transparent
          opacity={isLight ? 0.06 : 0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.85, 12, 12]} />
        <meshBasicMaterial
          color="#FF7A1A"
          transparent
          opacity={isLight ? 0.5 : 0.65}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#FF9A4D" intensity={isLight ? 0.35 : 0.55} distance={55} />
    </group>
  );
}

function EnergyTrail({
  arc,
  arcIndex,
  arcCount,
  reduceMotion,
  isLight,
}: {
  arc: DeploymentArc;
  arcIndex: number;
  arcCount: number;
  reduceMotion: boolean;
  isLight: boolean;
}) {
  const glowRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const headGlowRef = useRef<THREE.Mesh>(null);
  const arrowRef = useRef<THREE.Group>(null);
  const glowCurve = useRef(new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]));
  const coreCurve = useRef(new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]));

  useFrame(({ clock }) => {
    const headT = arcHeadProgress(clock.elapsedTime, arcIndex, arcCount, reduceMotion);
    const visible = headT !== null;

    if (glowRef.current) glowRef.current.visible = visible;
    if (coreRef.current) coreRef.current.visible = visible;
    if (headGlowRef.current) headGlowRef.current.visible = visible;
    if (arrowRef.current) arrowRef.current.visible = visible;

    if (!visible || headT === null) return;

    const tailT = Math.max(0, headT - ARC_TRAIL_LENGTH);
    if (headT - tailT < 0.008) return;

    const points = sampleArc(
      arc.startLat,
      arc.startLng,
      arc.endLat,
      arc.endLng,
      tailT,
      headT,
      TRAIL_SEGMENTS,
      ARC_ALTITUDE,
    );

    glowCurve.current.points = points;
    glowCurve.current.updateArcLengths();

    const headSplit = Math.max(2, Math.floor(points.length * 0.42));
    const headPoints = points.slice(headSplit - 1);
    coreCurve.current.points = headPoints.length >= 2 ? headPoints : points.slice(-2);
    coreCurve.current.updateArcLengths();

    if (glowRef.current) replaceTube(glowRef.current, glowCurve.current, 0.42);
    if (coreRef.current) replaceTube(coreRef.current, coreCurve.current, 0.22);
    if (headGlowRef.current) replaceTube(headGlowRef.current, coreCurve.current, 0.62);

    if (arrowRef.current) {
      const headPos = points[points.length - 1]!;
      const tangent = arcTangent(arc.startLat, arc.startLng, arc.endLat, arc.endLng, headT, ARC_ALTITUDE);
      arrowRef.current.position.copy(headPos);
      orientAlongTangent(arrowRef.current, tangent);
    }
  });

  return (
    <group>
      <mesh ref={glowRef} renderOrder={10}>
        <tubeGeometry args={[glowCurve.current, 10, 0.42, 5, false]} />
        <meshBasicMaterial
          color="#FF7A1A"
          transparent
          opacity={isLight ? 0.08 : 0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={headGlowRef} renderOrder={10}>
        <tubeGeometry args={[coreCurve.current, 8, 0.62, 5, false]} />
        <meshBasicMaterial
          color="#FFB070"
          transparent
          opacity={isLight ? 0.1 : 0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={coreRef} renderOrder={11}>
        <tubeGeometry args={[coreCurve.current, 8, 0.22, 5, false]} />
        <meshBasicMaterial
          color={isLight ? "#FFAA55" : "#FFCC90"}
          transparent
          opacity={isLight ? 0.82 : 0.72}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={arrowRef} renderOrder={12}>
        <mesh geometry={ARROW_GEOMETRY} scale={0.95}>
          <meshBasicMaterial
            color={isLight ? "#FF8A30" : "#FFB870"}
            transparent
            opacity={isLight ? 0.92 : 0.88}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh scale={1.6}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshBasicMaterial
            color="#FF9A4D"
            transparent
            opacity={0.2}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

function ArcDestinationLabel({
  arc,
  arcIndex,
  arcCount,
  reduceMotion,
}: {
  arc: DeploymentArc;
  arcIndex: number;
  arcCount: number;
  reduceMotion: boolean;
}) {
  const labelRef = useRef<HTMLDivElement>(null);
  const pos = useMemo(
    () => interpolateArc(arc.startLat, arc.startLng, arc.endLat, arc.endLng, 1, ARC_ALTITUDE),
    [arc],
  );

  useFrame(({ clock }) => {
    if (!labelRef.current) return;
    const headT = arcHeadProgress(clock.elapsedTime, arcIndex, arcCount, reduceMotion);
    const alpha = headT !== null && headT > 0.68 ? Math.min(1, (headT - 0.68) / 0.22) : 0;
    labelRef.current.style.opacity = String(alpha);
  });

  return (
    <group position={pos} renderOrder={9}>
      <Html center distanceFactor={230} style={{ pointerEvents: "none" }} occlude>
        <div ref={labelRef} className="globe-arc-dest-label" style={{ opacity: 0 }}>
          <span className="globe-arc-dest-product">{arc.product}</span>
          <span className="globe-arc-dest-place">
            {arc.endFlag} {arc.endLabel}
          </span>
        </div>
      </Html>
    </group>
  );
}

type Props = {
  show: boolean;
  reduceMotion: boolean;
  isLight?: boolean;
  arcs?: DeploymentArc[];
};

export function GlobeArcFlow({ show, reduceMotion, isLight = false, arcs = DEPLOYMENT_ARCS }: Props) {
  if (!show) return null;

  const arcCount = arcs.length;
  if (arcCount === 0) return null;

  return (
    <group>
      <EthiopiaHubSpark reduceMotion={reduceMotion} isLight={isLight} />
      {arcs.map((arc, i) => (
        <EnergyTrail
          key={`trail-${arc.id}`}
          arc={arc}
          arcIndex={i}
          arcCount={arcCount}
          reduceMotion={reduceMotion}
          isLight={isLight}
        />
      ))}
      {arcs.map((arc, i) => (
        <ArcDestinationLabel
          key={`dest-${arc.id}`}
          arc={arc}
          arcIndex={i}
          arcCount={arcCount}
          reduceMotion={reduceMotion}
        />
      ))}
    </group>
  );
}
