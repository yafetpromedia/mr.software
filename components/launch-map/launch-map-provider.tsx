"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LaunchMapPayload } from "@/lib/launch-map/types";

type LaunchMapContextValue = {
  data: LaunchMapPayload;
  loading: boolean;
  refresh: () => Promise<void>;
};

const LaunchMapContext = createContext<LaunchMapContextValue | null>(null);

const POLL_MS = 30_000;

type Props = {
  initial: LaunchMapPayload;
  children: ReactNode;
};

export function LaunchMapProvider({ initial, children }: Props) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/launch-map", { cache: "no-store" });
      if (res.ok) {
        const next = (await res.json()) as LaunchMapPayload;
        setData(next);
      }
    } catch {
      /* keep last good payload */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const value = useMemo(
    () => ({ data, loading, refresh }),
    [data, loading, refresh],
  );

  return <LaunchMapContext.Provider value={value}>{children}</LaunchMapContext.Provider>;
}

export function useLaunchMap(): LaunchMapContextValue {
  const ctx = useContext(LaunchMapContext);
  if (!ctx) {
    throw new Error("useLaunchMap must be used within LaunchMapProvider");
  }
  return ctx;
}

/** Safe hook when provider may be absent (returns null). */
export function useLaunchMapOptional(): LaunchMapContextValue | null {
  return useContext(LaunchMapContext);
}
