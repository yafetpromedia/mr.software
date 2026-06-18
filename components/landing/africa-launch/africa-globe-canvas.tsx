"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const AfricaGlobeScene = dynamic(
  () =>
    import("@/components/landing/africa-launch/africa-globe-scene").then((m) => ({
      default: m.AfricaGlobeScene,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-end justify-center pb-[1%]">
        <div className="h-[min(82vw,940px)] w-[min(82vw,940px)] animate-pulse rounded-full border border-[#FF7A1A]/25 bg-[radial-gradient(circle_at_30%_30%,#1a2840,#0a0e18)] shadow-[0_0_80px_rgba(255,122,26,0.2)]" />
      </div>
    ),
  },
);

export function AfricaGlobeCanvas(props: ComponentProps<typeof AfricaGlobeScene>) {
  return <AfricaGlobeScene {...props} />;
}
