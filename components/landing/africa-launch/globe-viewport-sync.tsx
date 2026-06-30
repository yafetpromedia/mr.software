"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  /** Bump when layout/visibility changes so the canvas re-measures. */
  refreshKey: string | number | boolean;
};

function syncCanvasToContainer(
  gl: THREE.WebGLRenderer,
  camera: THREE.Camera,
  container: HTMLElement,
  setSize: (width: number, height: number, top?: number, left?: number) => void,
): boolean {
  const rect = container.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  if (w <= 0 || h <= 0) return false;

  setSize(w, h);

  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  return true;
}

/** Keeps the WebGL buffer matched to the hero container (fixes mobile first-paint crop). */
export function GlobeViewportSync({ refreshKey }: Props) {
  const { gl, camera, setSize, invalidate } = useThree();

  useLayoutEffect(() => {
    const container = gl.domElement.parentElement;
    if (!container) return;

    const sync = () => {
      if (syncCanvasToContainer(gl, camera, container, setSize)) {
        invalidate();
      }
    };

    sync();
    const raf = requestAnimationFrame(() => requestAnimationFrame(sync));
    const delayed = [50, 150, 400, 900, 1200].map((ms) => window.setTimeout(sync, ms));

    const observer = new ResizeObserver(sync);
    observer.observe(container);

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);

    return () => {
      cancelAnimationFrame(raf);
      delayed.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, [gl, camera, setSize, invalidate, refreshKey]);

  return null;
}
