import * as THREE from "three";

export const GLOBE_RADIUS = 100;

/** Default camera framing — centered on East Africa / launch hub. */
export const AFRICA_VIEW = {
  lat: 5.5,
  lng: 38.746,
} as const;

/** Matches three-globe lat/lng → Cartesian (same as globe texture & points). */
export function latLngToVector3(lat: number, lng: number, radius = GLOBE_RADIUS): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lng) * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Surface point slightly above globe mesh so trails attach visibly to land. */
export function hubSurfacePoint(lat: number, lng: number, lift = 1.006): THREE.Vector3 {
  return latLngToVector3(lat, lng, GLOBE_RADIUS * lift);
}

/** Great-circle interpolation with arc altitude bump (energy trail path). */
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

/** Unit tangent along an arc at parameter t (direction: start → end). */
export function arcTangent(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  t: number,
  arcAlt = 0.28,
  epsilon = 0.004,
): THREE.Vector3 {
  const t0 = Math.max(0, t - epsilon);
  const t1 = Math.min(1, t + epsilon);
  const p0 = interpolateArc(startLat, startLng, endLat, endLng, t0, arcAlt);
  const p1 = interpolateArc(startLat, startLng, endLat, endLng, t1, arcAlt);
  return p1.sub(p0).normalize();
}

/** Sample points along an arc between tailT and headT, pinned to hub at the origin. */
export function sampleArc(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  tailT: number,
  headT: number,
  segments: number,
  arcAlt = 0.28,
): THREE.Vector3[] {
  const origin = hubSurfacePoint(startLat, startLng);
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const t = tailT + (headT - tailT) * u;
    if (t <= 0.001) {
      points.push(origin.clone());
    } else {
      points.push(interpolateArc(startLat, startLng, endLat, endLng, t, arcAlt));
    }
  }

  if (tailT <= 0.001 && points.length > 0) {
    points[0]!.copy(origin);
  }

  return points;
}
