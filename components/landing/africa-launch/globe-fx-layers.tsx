"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLOBE_RADIUS } from "@/lib/landing/globe-math";

const RIM_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const RIM_FRAGMENT = /* glsl */ `
  uniform vec3 uCameraPosition;
  uniform float uIntensity;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float ndv = max(dot(viewDir, vNormal), 0.0);
    float rim = 1.0 - ndv;
    float soft = pow(rim, 1.1);
    soft = smoothstep(0.0, 0.62, soft);
    vec3 coolEdge = vec3(0.72, 0.80, 0.95);
    vec3 warmEdge = vec3(0.95, 0.78, 0.55);
    vec3 color = mix(coolEdge, warmEdge, soft * 0.35);
    gl_FragColor = vec4(color, soft * soft * soft * soft * uIntensity);
  }
`;

type FxProps = {
  energyPulse?: boolean;
};

export function GlobeRimEdge({ energyPulse = false }: FxProps) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uCameraPosition: { value: new THREE.Vector3() },
          uIntensity: { value: 0.22 },
        },
        vertexShader: RIM_VERTEX,
        fragmentShader: RIM_FRAGMENT,
      }),
    [],
  );

  useFrame(({ camera }) => {
    mat.uniforms.uCameraPosition!.value.copy(camera.position);
    mat.uniforms.uIntensity!.value = energyPulse ? 0.28 : 0.22;
  });

  return (
    <mesh scale={1.038} renderOrder={3}>
      <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export function GlobeOuterHalo({ energyPulse = false }: FxProps) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uCameraPosition: { value: new THREE.Vector3() },
          uIntensity: { value: 0.07 },
        },
        vertexShader: RIM_VERTEX,
        fragmentShader: RIM_FRAGMENT,
      }),
    [],
  );

  useFrame(({ camera }) => {
    mat.uniforms.uCameraPosition!.value.copy(camera.position);
    mat.uniforms.uIntensity!.value = energyPulse ? 0.15 : 0.1;
  });

  return (
    <mesh scale={1.2} renderOrder={0}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export function GlobeBrandHalo() {
  return (
    <mesh scale={1.22} renderOrder={0}>
      <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
      <meshBasicMaterial
        color="#a8c4e8"
        transparent
        opacity={0.012}
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
