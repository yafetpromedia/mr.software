"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MIN_REVEAL_MS = 900;
const PULSE_DELAY_MS = 480;
const PULSE_DURATION_MS = 1500;

export function useHeroIntro(reduceMotion: boolean) {
  const [globeReady, setGlobeReady] = useState(false);
  const [veilVisible, setVeilVisible] = useState(!reduceMotion);
  const [globeRevealed, setGlobeRevealed] = useState(!!reduceMotion);
  const [energyPulse, setEnergyPulse] = useState(false);
  const [copyVisible, setCopyVisible] = useState(!!reduceMotion);
  const mountAt = useRef(Date.now());
  const revealedRef = useRef(!!reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const copyTimer = window.setTimeout(() => setCopyVisible(true), 450);
    return () => window.clearTimeout(copyTimer);
  }, [reduceMotion]);

  const tryReveal = useCallback(() => {
    if (revealedRef.current || reduceMotion || !globeReady) return;

    const elapsed = Date.now() - mountAt.current;
    const wait = Math.max(0, MIN_REVEAL_MS - elapsed);

    window.setTimeout(() => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      setVeilVisible(false);
      setGlobeRevealed(true);

      window.setTimeout(() => setEnergyPulse(true), PULSE_DELAY_MS);
      window.setTimeout(() => setEnergyPulse(false), PULSE_DELAY_MS + PULSE_DURATION_MS);
    }, wait);
  }, [globeReady, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !globeReady) return;
    tryReveal();
  }, [globeReady, reduceMotion, tryReveal]);

  return {
    globeReady,
    setGlobeReady,
    veilVisible,
    globeRevealed,
    energyPulse,
    copyVisible,
  };
}
