import { decodePolyline, minDistanceToPolylineKm } from "@/lib/geo";
import {
  explainRecommendation,
  pickRecommendedRoute,
  roadConditionScore,
  shouldTreatAsActiveHazard,
} from "@/lib/scoring";
import type {
  GeoPoint,
  Issue,
  RouteHazard,
  RoutePreference,
  ScoredRoute,
} from "@/lib/types";
import { HAZARD_META } from "@/lib/constants";

export interface GeocodeHit {
  label: string;
  lat: number;
  lng: number;
  source: "local" | "nominatim";
}

export interface RoutingProvider {
  id: string;
  geocode(query: string): Promise<GeocodeHit[]>;
  route(from: GeoPoint, to: GeoPoint): Promise<{ geometry: GeoPoint[]; durationMin: number; distanceKm: number }[]>;
}

async function nominatimGeocode(query: string): Promise<GeocodeHit[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", `${query}, Accra, Ghana`);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  const res = await fetch(url.toString(), {
    headers: { "Accept-Language": "en", "User-Agent": "CivicGH/1.0 (civic accountability map)" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { display_name: string; lat: string; lon: string }[];
  return data.map((d) => ({
    label: d.display_name,
    lat: Number(d.lat),
    lng: Number(d.lon),
    source: "nominatim" as const,
  }));
}

async function osrmRoute(from: GeoPoint, to: GeoPoint) {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline&alternatives=true&steps=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Routing provider unavailable");
  const data = (await res.json()) as {
    code: string;
    routes?: { distance: number; duration: number; geometry: string }[];
  };
  if (data.code !== "Ok" || !data.routes?.length) throw new Error("No routes");
  return data.routes.slice(0, 3).map((r) => ({
    geometry: decodePolyline(r.geometry),
    durationMin: Math.round(r.duration / 60),
    distanceKm: Math.round((r.distance / 1000) * 10) / 10,
  }));
}

function mockRoutes(from: GeoPoint, to: GeoPoint) {
  const mid = (t: number, jitterLat: number, jitterLng: number): GeoPoint => ({
    lat: from.lat + (to.lat - from.lat) * t + jitterLat,
    lng: from.lng + (to.lng - from.lng) * t + jitterLng,
  });
  const dist =
    Math.hypot((to.lat - from.lat) * 111, (to.lng - from.lng) * 111 * Math.cos((from.lat * Math.PI) / 180));
  return [
    {
      geometry: [from, mid(0.35, 0.004, -0.006), mid(0.7, 0.002, -0.002), to],
      durationMin: Math.max(12, Math.round(dist * 2.6)),
      distanceKm: Math.round(dist * 10) / 10,
    },
    {
      geometry: [from, mid(0.3, -0.01, 0.008), mid(0.65, -0.006, 0.012), to],
      durationMin: Math.max(14, Math.round(dist * 2.9) + 4),
      distanceKm: Math.round((dist + 1.8) * 10) / 10,
    },
    {
      geometry: [from, mid(0.25, 0.012, 0.01), mid(0.55, 0.016, 0.002), mid(0.8, 0.008, -0.004), to],
      durationMin: Math.max(16, Math.round(dist * 3.1) + 7),
      distanceKm: Math.round((dist + 3.1) * 10) / 10,
    },
  ];
}

export class OsrmRoutingProvider implements RoutingProvider {
  id = "osrm";
  async geocode(query: string) {
    try {
      return await nominatimGeocode(query);
    } catch {
      return [];
    }
  }
  async route(from: GeoPoint, to: GeoPoint) {
    try {
      return await osrmRoute(from, to);
    } catch {
      return mockRoutes(from, to);
    }
  }
}

let currentProvider: RoutingProvider = new OsrmRoutingProvider();

export function getRoutingProvider() {
  return currentProvider;
}

export function setRoutingProvider(provider: RoutingProvider) {
  currentProvider = provider;
}

function hazardsAlong(geometry: GeoPoint[], issues: Issue[]): RouteHazard[] {
  const BUFFER_KM = 0.35;
  const hazards: RouteHazard[] = [];
  for (const issue of issues) {
    if (!shouldTreatAsActiveHazard(issue) || !issue.roadHazard) continue;
    const d = minDistanceToPolylineKm(issue.location, geometry);
    if (d <= BUFFER_KM) {
      hazards.push({
        issueId: issue.id,
        title: issue.title,
        hazard: issue.roadHazard,
        severity: issue.severity,
        status: issue.status,
        confidence: issue.confidence,
        distanceAlongKm: d,
      });
    }
  }
  return hazards;
}

export function scoreRoutes(
  raw: { geometry: GeoPoint[]; durationMin: number; distanceKm: number }[],
  issues: Issue[],
  preference: RoutePreference,
): ScoredRoute[] {
  const labels = ["Route A", "Route B", "Route C"];
  const scored: ScoredRoute[] = raw.map((r, i) => {
    const hazards = hazardsAlong(r.geometry, issues);
    const related = issues.filter((issue) => hazards.some((h) => h.issueId === issue.id));
    const floodWarning = hazards.some(
      (h) => h.hazard === "flooding" && (h.severity === "high" || h.severity === "critical"),
    );
    const conditionScore = roadConditionScore(
      related.length
        ? related
        : issues.filter((iss) => iss.isRoadRelated && minDistanceToPolylineKm(iss.location, r.geometry) < 0.6),
    );
    const counts = hazards.reduce<Record<string, number>>((acc, h) => {
      acc[h.hazard] = (acc[h.hazard] ?? 0) + 1;
      return acc;
    }, {});
    const parts = Object.entries(counts).map(
      ([k, n]) => `${n} ${HAZARD_META[k as keyof typeof HAZARD_META].label.toLowerCase()} report${n === 1 ? "" : "s"}`,
    );
    const summary =
      hazards.length === 0
        ? "No major reported road problems on this route."
        : `${hazards.length} reported road problem${hazards.length === 1 ? "" : "s"}`;
    return {
      id: `route-${i}`,
      label: labels[i] ?? `Route ${i + 1}`,
      durationMin: r.durationMin,
      distanceKm: r.distanceKm,
      geometry: r.geometry,
      hazards,
      conditionScore,
      floodWarning,
      summary: parts.length ? `${summary} · ${parts.join(", ")}` : summary,
    };
  });

  const fastest = pickRecommendedRoute(scored, "fastest")!;
  const chosen = pickRecommendedRoute(scored, preference)!;
  return scored.map((s) => ({
    ...s,
    recommendation: s.id === chosen.id ? explainRecommendation(s, fastest) : undefined,
  }));
}

export async function planTrip(
  from: GeoPoint,
  to: GeoPoint,
  issues: Issue[],
  preference: RoutePreference,
) {
  const provider = getRoutingProvider();
  const raw = await provider.route(from, to);
  return scoreRoutes(raw, issues, preference);
}
