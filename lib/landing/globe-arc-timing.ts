/** Shared staggered arc timing — travel window + quiet gap before the next launch. */
export const ARC_TRAVEL_MS = 3200;
export const ARC_GAP_MS = 1800;
export const ARC_LAUNCH_STAGGER_MS = ARC_TRAVEL_MS + ARC_GAP_MS;

/**
 * Progress along an arc (0–1) for a given arc slot, or null when idle (gap / not this arc's turn).
 */
export function arcHeadProgress(
  elapsedSec: number,
  arcIndex: number,
  arcCount: number,
  reduceMotion: boolean,
): number | null {
  if (arcCount <= 0) return null;

  const totalCycle = ARC_LAUNCH_STAGGER_MS * arcCount;
  const t = (elapsedSec * 1000) % totalCycle;
  const local = t - arcIndex * ARC_LAUNCH_STAGGER_MS;

  if (local < 0 || local >= ARC_LAUNCH_STAGGER_MS) return null;
  if (local > ARC_TRAVEL_MS) return null;

  if (reduceMotion) return 0.72;
  return Math.min(0.998, local / ARC_TRAVEL_MS);
}

/** @deprecated Use ARC_TRAVEL_MS */
export const ARC_ANIMATE_MS = ARC_TRAVEL_MS;

export const ARC_TRAIL_LENGTH = 0.24;
