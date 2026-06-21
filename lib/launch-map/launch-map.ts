import { DeploymentStatus, LaunchMapMode, PurchaseStatus } from "@prisma/client";
import {
  DEPLOYMENT_ARCS,
  LIVE_EVENTS,
  type DeploymentArc,
  type LiveEvent,
} from "@/lib/landing/africa-hero-data";
import {
  AFRICAN_ORIGIN_CITIES,
  GLOBAL_DESTINATION_CITIES,
  pickFromList,
} from "@/lib/launch-map/cities";
import type { LaunchMapPayload, LaunchMapPoint, LaunchMapStats } from "@/lib/launch-map/types";
import { prisma } from "@/lib/prisma";

const HYBRID_MIN_LIVE_ARCS = 3;

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function pointToArc(point: LaunchMapPoint): DeploymentArc {
  return {
    id: point.id,
    startLat: point.originLat,
    startLng: point.originLng,
    endLat: point.lat,
    endLng: point.lng,
    product: point.productName,
    endLabel: point.country,
    endFlag: point.flag,
  };
}

function pointToEvent(point: LaunchMapPoint): LiveEvent {
  const icon =
    point.type === "deploy" ? "🚀" : point.type === "listing" ? "📦" : "💰";
  const title =
    point.type === "deploy"
      ? "New deployment"
      : point.type === "listing"
        ? "New listing"
        : "New sale";
  const handleSuffix = point.handle ? ` · @${point.handle}` : "";
  return {
    id: point.id,
    icon,
    title,
    detail: `${point.productName} → ${point.city}${handleSuffix}`,
  };
}

async function fetchLivePoints(limit = 24): Promise<LaunchMapPoint[]> {
  const [deployments, listings, sales] = await Promise.all([
    prisma.deployment.findMany({
      where: { status: DeploymentStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        createdAt: true,
        userId: true,
        software: { select: { name: true } },
        user: {
          select: {
            storefront: { select: { handle: true } },
          },
        },
      },
    }),
    prisma.software.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        createdAt: true,
        developerId: true,
        developer: {
          select: {
            storefront: { select: { handle: true } },
          },
        },
      },
    }),
    prisma.purchase.findMany({
      where: { status: PurchaseStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 12),
      select: {
        id: true,
        createdAt: true,
        amountCents: true,
        currency: true,
        software: {
          select: {
            name: true,
            developerId: true,
            developer: {
              select: {
                storefront: { select: { handle: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const points: LaunchMapPoint[] = [];

  for (const d of deployments) {
    const origin = pickFromList(AFRICAN_ORIGIN_CITIES, d.userId);
    const dest = pickFromList(GLOBAL_DESTINATION_CITIES, d.id);
    const productName = d.software?.name ?? d.name;
    const iso = d.createdAt.toISOString();
    points.push({
      id: `deploy-${d.id}`,
      type: "deploy",
      city: dest.city,
      country: dest.country,
      flag: dest.flag,
      productName,
      handle: d.user.storefront?.handle ?? null,
      originCity: origin.city,
      originCountry: origin.country,
      originFlag: origin.flag,
      lat: dest.lat,
      lng: dest.lng,
      originLat: origin.lat,
      originLng: origin.lng,
      occurredAt: iso,
      relativeTime: formatRelativeTime(iso),
    });
  }

  for (const s of listings) {
    const origin = pickFromList(AFRICAN_ORIGIN_CITIES, s.developerId);
    const dest = pickFromList(GLOBAL_DESTINATION_CITIES, s.id);
    const iso = s.createdAt.toISOString();
    points.push({
      id: `listing-${s.id}`,
      type: "listing",
      city: dest.city,
      country: dest.country,
      flag: dest.flag,
      productName: s.name,
      handle: s.developer.storefront?.handle ?? null,
      originCity: origin.city,
      originCountry: origin.country,
      originFlag: origin.flag,
      lat: dest.lat,
      lng: dest.lng,
      originLat: origin.lat,
      originLng: origin.lng,
      occurredAt: iso,
      relativeTime: formatRelativeTime(iso),
    });
  }

  for (const p of sales) {
    const origin = pickFromList(AFRICAN_ORIGIN_CITIES, p.software.developerId);
    const dest = pickFromList(GLOBAL_DESTINATION_CITIES, p.id);
    const iso = p.createdAt.toISOString();
    points.push({
      id: `sale-${p.id}`,
      type: "sale",
      city: dest.city,
      country: dest.country,
      flag: dest.flag,
      productName: p.software.name,
      handle: p.software.developer.storefront?.handle ?? null,
      originCity: origin.city,
      originCountry: origin.country,
      originFlag: origin.flag,
      lat: dest.lat,
      lng: dest.lng,
      originLat: origin.lat,
      originLng: origin.lng,
      occurredAt: iso,
      relativeTime: formatRelativeTime(iso),
    });
  }

  return points
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
}

function demoPoints(): LaunchMapPoint[] {
  return DEPLOYMENT_ARCS.map((arc, i) => {
    const event = LIVE_EVENTS[i % LIVE_EVENTS.length]!;
    const iso = new Date(Date.now() - (i + 1) * 3600_000).toISOString();
    return {
      id: arc.id,
      type: "deploy" as const,
      city: arc.endLabel,
      country: arc.endLabel,
      flag: arc.endFlag,
      productName: arc.product,
      handle: null,
      originCity: "Addis Ababa",
      originCountry: "Ethiopia",
      originFlag: "🇪🇹",
      lat: arc.endLat,
      lng: arc.endLng,
      originLat: arc.startLat,
      originLng: arc.startLng,
      occurredAt: iso,
      relativeTime: formatRelativeTime(iso),
    };
  });
}

function buildStats(points: LaunchMapPoint[]): LaunchMapStats {
  const builders = new Set(points.map((p) => p.handle).filter(Boolean));
  const countries = new Set(points.map((p) => p.country));
  return {
    launches: points.filter((p) => p.type === "deploy").length,
    listings: points.filter((p) => p.type === "listing").length,
    sales: points.filter((p) => p.type === "sale").length,
    builders: builders.size,
    countries: countries.size,
  };
}

function mergeHybrid(live: LaunchMapPoint[], demo: LaunchMapPoint[]): LaunchMapPoint[] {
  if (live.length >= HYBRID_MIN_LIVE_ARCS) return live;
  const seen = new Set(live.map((p) => p.id));
  const merged = [...live];
  for (const d of demo) {
    if (merged.length >= DEPLOYMENT_ARCS.length) break;
    if (!seen.has(d.id)) merged.push(d);
  }
  return merged;
}

export async function getLaunchMapMode(): Promise<LaunchMapMode> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: { launchMapMode: true },
    });
    return row?.launchMapMode ?? LaunchMapMode.HYBRID;
  } catch {
    return LaunchMapMode.HYBRID;
  }
}

export async function getLaunchMapPayload(): Promise<LaunchMapPayload> {
  const mode = await getLaunchMapMode();
  const live = await fetchLivePoints();
  const demo = demoPoints();

  let points: LaunchMapPoint[];
  let source: LaunchMapPayload["source"];

  if (mode === LaunchMapMode.DEMO) {
    points = demo;
    source = "demo";
  } else if (mode === LaunchMapMode.LIVE) {
    points = live.length > 0 ? live : demo;
    source = live.length > 0 ? "live" : "demo";
  } else {
    points = mergeHybrid(live, demo);
    source = live.length >= HYBRID_MIN_LIVE_ARCS ? "live" : "hybrid";
  }

  const arcs = points.map(pointToArc);
  const events = points.slice(0, 12).map(pointToEvent);

  return {
    mode,
    source,
    updatedAt: new Date().toISOString(),
    stats: buildStats(points),
    points,
    arcs,
    events: events.length > 0 ? events : LIVE_EVENTS,
  };
}

export async function updateLaunchMapMode(mode: LaunchMapMode): Promise<LaunchMapMode> {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, launchMapMode: mode },
    update: { launchMapMode: mode },
  });
  return mode;
}
