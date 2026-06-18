"use client";

import { useEffect, useState } from "react";
import { DEPLOYMENT_ARCS, LAUNCH_STORY, type LaunchStoryStep } from "@/lib/landing/africa-hero-data";

export type TravelState = {
  arcId: string;
  product: string;
  endLabel: string;
  endFlag: string;
  progress: number;
  arrived: boolean;
};

export type CinematicState = LaunchStoryStep & {
  travel: TravelState | null;
  timelineIndex: number;
};

const LOOP_PAD_MS = 6000;

export function useCinematicStory(reduceMotion: boolean): CinematicState {
  const [state, setState] = useState<CinematicState>(() => ({
    ...LAUNCH_STORY[0]!,
    travel: null,
    timelineIndex: 0,
  }));

  useEffect(() => {
    if (reduceMotion) {
      setState({
        ...LAUNCH_STORY[LAUNCH_STORY.length - 1]!,
        travel: null,
        timelineIndex: LAUNCH_STORY.length - 1,
      });
      return;
    }

    let start = Date.now();
    let travelStart = 0;
    let activeTravel: { arcId: string; travelMs: number; stepIndex: number } | null = null;

    const id = window.setInterval(() => {
      let elapsed = Date.now() - start;
      const loopEnd = LAUNCH_STORY[LAUNCH_STORY.length - 1]!.atMs + LOOP_PAD_MS;

      if (elapsed > loopEnd) {
        start = Date.now();
        elapsed = 0;
        travelStart = 0;
        activeTravel = null;
      }

      let step = LAUNCH_STORY[0]!;
      let stepIndex = 0;
      for (let i = 0; i < LAUNCH_STORY.length; i++) {
        if (elapsed >= LAUNCH_STORY[i]!.atMs) {
          step = LAUNCH_STORY[i]!;
          stepIndex = i;
        }
      }

      if (step.travelArcId && step.travelMs) {
        if (!activeTravel || activeTravel.stepIndex !== stepIndex) {
          activeTravel = { arcId: step.travelArcId, travelMs: step.travelMs, stepIndex };
          travelStart = Date.now();
        }
      } else if (activeTravel && activeTravel.stepIndex !== stepIndex) {
        activeTravel = null;
      }

      let travel: TravelState | null = null;
      if (activeTravel) {
        const arc = DEPLOYMENT_ARCS.find((a) => a.id === activeTravel!.arcId);
        if (arc) {
          const raw = Math.min(1, (Date.now() - travelStart) / activeTravel.travelMs);
          const progress = 1 - (1 - raw) ** 2;
          travel = {
            arcId: arc.id,
            product: arc.product,
            endLabel: arc.endLabel,
            endFlag: arc.endFlag,
            progress,
            arrived: progress >= 0.98,
          };
        }
      }

      setState({ ...step, travel, timelineIndex: stepIndex });
    }, 32);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return state;
}
