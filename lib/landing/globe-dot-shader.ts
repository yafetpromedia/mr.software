import * as THREE from "three";

export const DOT_GLOBE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const DOT_GLOBE_FRAGMENT = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uBumpMap;
  uniform float uTime;
  uniform float uEnergyPulse;
  uniform vec3 uCameraPosition;
  uniform vec3 uSunDirection;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  float latFromUv(vec2 uv) {
    return (0.5 - uv.y) * 180.0;
  }

  float lngFromUv(vec2 uv) {
    return (uv.x - 0.5) * 360.0;
  }

  float africaMask(float lat, float lng) {
    float latBand = smoothstep(-36.0, -28.0, lat) * (1.0 - smoothstep(32.0, 37.0, lat));
    float lngBand = smoothstep(-20.0, -8.0, lng) * (1.0 - smoothstep(46.0, 54.0, lng));
    return latBand * lngBand;
  }

  void main() {
    vec4 day = texture2D(uDayMap, vUv);
    vec4 night = texture2D(uNightMap, vUv);
    float bump = texture2D(uBumpMap, vUv).r;

    float lat = latFromUv(vUv);
    float lng = lngFromUv(vUv);
    float africa = africaMask(lat, lng);

    // Real continent mask — oceans are blue on day map
    float oceanScore = day.b - max(day.r, day.g) * 0.85;
    float landMask = smoothstep(0.02, 0.14, 0.22 - oceanScore);
    landMask = max(landMask, smoothstep(0.48, 0.58, bump) * 0.85);

    float cities = smoothstep(0.02, 0.28, dot(night.rgb, vec3(0.299, 0.587, 0.114)));

    // Dot grid — visible on land only
    float density = mix(78.0, 58.0, africa);
    vec2 cell = fract(vUv * density) - 0.5;
    float dotRad = mix(0.34, 0.48, africa);
    float dotShape = smoothstep(dotRad, dotRad - 0.14, length(cell));

    // Africa: solid glowing landmass (reference style)
    float africaPulse = 0.04 * sin(uTime * 1.8 + lat * 0.08);
    float africaSolid = africa * landMask * (0.82 + africaPulse + bump * 0.15);

    // Land dots — sparse on oceans, dense on cities
    float landDots = dotShape * landMask * (0.18 + cities * 1.4 + bump * 0.12);

    float intensity = max(landDots, africaSolid * 1.25);

    // Directional sun — bright top-left rim like reference
    float sunLit = max(dot(normalize(vNormal), normalize(uSunDirection)), 0.0);
    float shade = mix(0.08, 1.0, pow(sunLit, 0.85));
    intensity *= shade;
    intensity = max(intensity, africaSolid * 0.92);

    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.2);
    float rimBoost = fresnel * (0.5 + sunLit * 0.4);

    vec3 deep = vec3(0.35, 0.08, 0.01);
    vec3 amber = vec3(1.0, 0.48, 0.08);
    vec3 gold = vec3(1.0, 0.82, 0.38);
    vec3 color = mix(deep, amber, clamp(intensity * 1.2, 0.0, 1.0));
    color = mix(color, gold, africa * 0.75 + cities * 0.2);
    color += vec3(1.0, 0.72, 0.28) * rimBoost * (0.55 + uEnergyPulse * 0.2);

    float alpha = clamp(intensity * 1.1 + rimBoost * 0.45, 0.0, 1.0);

    // Transparent oceans — only rim or land visible
    if (landMask < 0.06 && africa < 0.04 && rimBoost < 0.12) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

export const SUN_DIRECTION = new THREE.Vector3(-0.55, 0.82, 0.28).normalize();

export function createDotGlobeMaterial(
  dayMap: THREE.Texture,
  nightMap: THREE.Texture,
  bumpMap: THREE.Texture,
): THREE.ShaderMaterial {
  dayMap.colorSpace = THREE.SRGBColorSpace;
  nightMap.colorSpace = THREE.SRGBColorSpace;
  bumpMap.colorSpace = THREE.NoColorSpace;

  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    uniforms: {
      uDayMap: { value: dayMap },
      uNightMap: { value: nightMap },
      uBumpMap: { value: bumpMap },
      uTime: { value: 0 },
      uEnergyPulse: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
      uSunDirection: { value: SUN_DIRECTION.clone() },
    },
    vertexShader: DOT_GLOBE_VERTEX,
    fragmentShader: DOT_GLOBE_FRAGMENT,
  });
}
