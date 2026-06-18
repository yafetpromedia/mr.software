import * as THREE from "three";

export const GLOBE_RADIUS = 100;

export function latLngToVector3(lat: number, lng: number, radius = GLOBE_RADIUS): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Great-circle interpolation with arc altitude bump (neon trail path). */
export function interpolateArc(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  t: number,
  arcAlt = 0.28,
): THREE.Vector3 {
  const start = latLngToVector3(startLat, startLng, 1).normalize();
  const end = latLngToVector3(endLat, endLng, 1).normalize();
  const angle = start.angleTo(end);
  const sinAngle = Math.sin(angle);

  let mix: THREE.Vector3;
  if (sinAngle < 1e-6) {
    mix = start.clone();
  } else {
    const a = Math.sin((1 - t) * angle) / sinAngle;
    const b = Math.sin(t * angle) / sinAngle;
    mix = new THREE.Vector3(
      a * start.x + b * end.x,
      a * start.y + b * end.y,
      a * start.z + b * end.z,
    );
  }

  const altitude = 1 + Math.sin(t * Math.PI) * arcAlt;
  return mix.multiplyScalar(GLOBE_RADIUS * altitude);
}
