import type { LaunchMapMode } from "@prisma/client";
import type { DeploymentArc, LiveEvent } from "@/lib/landing/africa-hero-data";

export type LaunchMapEventType = "deploy" | "listing" | "sale";

export type LaunchMapPoint = {
  id: string;
  type: LaunchMapEventType;
  city: string;
  country: string;
  flag: string;
  productName: string;
  handle: string | null;
  originCity: string;
  originCountry: string;
  originFlag: string;
  lat: number;
  lng: number;
  originLat: number;
  originLng: number;
  occurredAt: string;
  relativeTime: string;
};

export type LaunchMapStats = {
  launches: number;
  listings: number;
  sales: number;
  builders: number;
  countries: number;
};

export type LaunchMapPayload = {
  mode: LaunchMapMode;
  source: "live" | "demo" | "hybrid";
  updatedAt: string;
  stats: LaunchMapStats;
  points: LaunchMapPoint[];
  arcs: DeploymentArc[];
  events: LiveEvent[];
};
