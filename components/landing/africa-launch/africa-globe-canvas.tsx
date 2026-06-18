"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { AfricaGlobeErrorBoundary } from "@/components/landing/africa-launch/africa-globe-error-boundary";
import type { AfricaGlobeSceneProps } from "@/components/landing/africa-launch/africa-globe-scene";
import { importWithChunkRetry } from "@/lib/import-with-chunk-retry";

/** Invisible while the 3D chunk loads — veil covers the hero until textures are ready. */
function GlobeLoading() {
  return null;
}

const AfricaGlobeScene = dynamic(
  () =>
    importWithChunkRetry(() =>
      import("@/components/landing/africa-launch/africa-globe-scene").then((m) => ({
        default: m.AfricaGlobeScene,
      })),
    ),
  {
    ssr: false,
    loading: GlobeLoading,
  },
);

export function AfricaGlobeCanvas(props: ComponentProps<typeof AfricaGlobeScene>) {
  return (
    <AfricaGlobeErrorBoundary>
      <AfricaGlobeScene {...props} />
    </AfricaGlobeErrorBoundary>
  );
}

export type { AfricaGlobeSceneProps };
