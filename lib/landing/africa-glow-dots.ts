const CDN = "https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img";



export const GLOBE_TEXTURES = {

  night: `${CDN}/earth-night.jpg`,

  day: `${CDN}/earth-blue-marble.jpg`,

  bump: `${CDN}/earth-topology.png`,

} as const;



/** Day marble for geography; night overlay applied in shader for dark mode. */

export function getGlobeTextures(_isLight: boolean) {

  return {

    globe: GLOBE_TEXTURES.day,

    bump: GLOBE_TEXTURES.bump,

    night: GLOBE_TEXTURES.night,

  };

}

