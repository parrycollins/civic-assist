import { findPlaces } from "@/data/areas";
import { inGreaterAccra } from "@/lib/accra";
import { decodePolyline, haversineKm, minDistanceToPolylineKm, toRad } from "@/lib/geo";
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
  route(
    from: GeoPoint,
    to: GeoPoint,
    vias?: GeoPoint[],
  ): Promise<{ geometry: GeoPoint[]; durationMin: number; distanceKm: number }[]>;
}

type RawRoute = { geometry: GeoPoint[]; durationMin: number; distanceKm: number };

async function nominatimGeocode(query: string): Promise<GeocodeHit[]> {
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { hits?: GeocodeHit[] };
    return data.hits ?? [];
  } catch {
    return [];
  }
}

async function osrmRoute(from: GeoPoint, to: GeoPoint, vias: GeoPoint[] = []): Promise<RawRoute[]> {
  const params = new URLSearchParams({
    from: `${from.lng},${from.lat}`,
    to: `${to.lng},${to.lat}`,
  });
  for (const via of vias) params.append("via", `${via.lng},${via.lat}`);
  const res = await fetch(`/api/route?${params.toString()}`);
  if (!res.ok) throw new Error("Routing provider unavailable");
  const data = (await res.json()) as {
    code?: string;
    routes?: { distance: number; duration: number; geometry: string }[];
    error?: string;
  };
  if (data.code !== "Ok" || !data.routes?.length) throw new Error(data.error || "No routes");
  return data.routes.slice(0, 3).map((route) => ({
    geometry: decodePolyline(route.geometry),
    durationMin: Math.round(route.duration / 60),
    distanceKm: Math.round((route.distance / 1000) * 10) / 10,
  }));
}

function mockRoutes(from: GeoPoint, to: GeoPoint): RawRoute[] {
  const mid = (t: number, jitterLat: number, jitterLng: number): GeoPoint => ({
    lat: from.lat + (to.lat - from.lat) * t + jitterLat,
    lng: from.lng + (to.lng - from.lng) * t + jitterLng,
  });
  const dist = Math.hypot((to.lat - from.lat) * 111, (to.lng - from.lng) * 111 * Math.cos((from.lat * Math.PI) / 180));
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

function offsetFromMid(from: GeoPoint, to: GeoPoint, km: number, sign: 1 | -1): GeoPoint {
  const mid = { lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2 };
  const dlat = to.lat - from.lat;
  const dlng = to.lng - from.lng;
  const len = Math.hypot(dlat, dlng) || 1;
  const plat = -dlng / len;
  const plng = dlat / len;
  const degLat = km / 110.57;
  const degLng = km / (111.32 * Math.cos(toRad(mid.lat)));
  const point = {
    lat: mid.lat + plat * degLat * sign,
    lng: mid.lng + plng * degLng * sign,
  };
  return inGreaterAccra(point) ? point : mid;
}

function nearestVertex(point: GeoPoint, line: GeoPoint[]) {
  let best = line[0] ?? point;
  let bestD = Infinity;
  let index = 0;
  line.forEach((vertex, i) => {
    const d = haversineKm(point, vertex);
    if (d < bestD) {
      bestD = d;
      best = vertex;
      index = i;
    }
  });
  return { point: best, index };
}

function hazardDetourVias(geometry: GeoPoint[], issues: Issue[]): GeoPoint[] {
  const hazards = hazardsAlong(geometry, issues).filter(
    (h) =>
      h.hazard === "flooding" ||
      h.hazard === "closure" ||
      h.hazard === "pothole" ||
      h.hazard === "damaged_road" ||
      h.severity === "high" ||
      h.severity === "critical",
  );
  const worst = [...hazards].sort((a, b) => {
    const rank = (h: RouteHazard) =>
      (h.hazard === "flooding" || h.hazard === "closure" ? 20 : 8) + (h.severity === "critical" ? 10 : 0);
    return rank(b) - rank(a);
  })[0];
  if (!worst) return [];
  const issue = issues.find((item) => item.id === worst.issueId);
  if (!issue) return [];
  const { index, point } = nearestVertex(issue.location, geometry);
  const prev = geometry[Math.max(0, index - 1)] ?? point;
  const next = geometry[Math.min(geometry.length - 1, index + 1)] ?? point;
  return [offsetFromMid(prev, next, 1.8, 1), offsetFromMid(prev, next, 1.8, -1)].filter(inGreaterAccra);
}

export class OsrmRoutingProvider implements RoutingProvider {
  id = "osrm";
  async geocode(query: string) {
    return nominatimGeocode(query);
  }
  async route(from: GeoPoint, to: GeoPoint, vias: GeoPoint[] = []) {
    try {
      return await osrmRoute(from, to, vias);
    } catch {
      // Don't mix mock corridors into a real OSRM result when a via-point fails.
      if (vias.length) return [];
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

export async function searchAccraPlaces(query: string): Promise<GeocodeHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const local: GeocodeHit[] = findPlaces(q)
    .slice(0, 8)
    .map((place) => ({
      label: place.name,
      lat: place.center.lat,
      lng: place.center.lng,
      source: "local" as const,
    }));
  const remote = await nominatimGeocode(q);
  const seen = new Set(local.map((hit) => hit.label.toLowerCase()));
  for (const hit of remote) {
    const key = hit.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    local.push(hit);
  }
  return local.slice(0, 10);
}

function hazardsAlong(geometry: GeoPoint[], issues: Issue[]): RouteHazard[] {
  const BUFFER_KM = 0.4;
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

function routeFingerprint(route: RawRoute) {
  const mid = route.geometry[Math.floor(route.geometry.length / 2)] ?? route.geometry[0];
  return `${route.durationMin}:${route.distanceKm}:${mid?.lat.toFixed(3)}:${mid?.lng.toFixed(3)}`;
}

function dedupeRoutes(routes: RawRoute[]) {
  const seen = new Set<string>();
  return routes.filter((route) => {
    const key = routeFingerprint(route);
    if (seen.has(key)) return false;
    seen.add(key);
    return route.geometry.length > 1;
  });
}

export function scoreRoutes(
  raw: RawRoute[],
  issues: Issue[],
  preference: RoutePreference,
): ScoredRoute[] {
  const labels = ["Route A", "Route B", "Route C", "Route D", "Route E"];
  const scored: ScoredRoute[] = raw.map((r, i) => {
    const hazards = hazardsAlong(r.geometry, issues);
    const related = issues.filter((issue) => hazards.some((h) => h.issueId === issue.id));
    const floodWarning = hazards.some(
      (h) => h.hazard === "flooding" && (h.severity === "high" || h.severity === "critical" || h.severity === "medium"),
    );
    const conditionScore = roadConditionScore(related);
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

  if (scored.length === 0) return scored;

  const fastest = pickRecommendedRoute(scored, "fastest")!;
  const bestCondition = pickRecommendedRoute(scored, "condition")!;
  const balanced = pickRecommendedRoute(scored, "balanced")!;
  const chosen = pickRecommendedRoute(scored, preference)!;

  return scored.map((route) => {
    let emphasis: ScoredRoute["emphasis"] = "alt";
    if (route.id === fastest.id) emphasis = "fastest";
    else if (route.id === bestCondition.id) emphasis = "condition";
    else if (route.id === balanced.id) emphasis = "balanced";
    if (fastest.id === bestCondition.id && route.id === fastest.id) emphasis = "fastest";
    return {
      ...route,
      emphasis,
      alsoBestCondition: route.id === fastest.id && fastest.id === bestCondition.id,
      recommendation: route.id === chosen.id ? explainRecommendation(route, fastest) : undefined,
    };
  });
}

/** Junctions that produce real Accra alternative corridors (not just a 50 m offset). */
const ACCRA_CORRIDORS: GeoPoint[] = [
  { lat: 5.56, lng: -0.205 }, // Kwame Nkrumah Circle
  { lat: 5.636, lng: -0.175 }, // Tetteh Quarshie
  { lat: 5.586, lng: -0.178 }, // 37
  { lat: 5.57, lng: -0.24 }, // Kaneshie
  { lat: 5.62, lng: -0.23 }, // Achimota
  { lat: 5.64, lng: -0.08 }, // Spintex
  { lat: 5.555, lng: -0.175 }, // Osu
  { lat: 5.677, lng: -0.164 }, // Madina Market
  { lat: 5.67, lng: -0.017 }, // Tema
  { lat: 5.58, lng: -0.32 }, // West Hills
  { lat: 5.54, lng: -0.27 }, // Dansoman
  { lat: 5.605, lng: -0.175 }, // Airport Residential
  { lat: 5.548, lng: -0.207 }, // Makola
  { lat: 5.63, lng: -0.1 }, // Coca-Cola roundabout
];

function uniqueVias(points: GeoPoint[], from: GeoPoint, to: GeoPoint) {
  const seen = new Set<string>();
  return points.filter((point) => {
    if (!inGreaterAccra(point)) return false;
    if (haversineKm(point, from) < 0.8 || haversineKm(point, to) < 0.8) return false;
    const key = `${point.lat.toFixed(3)}:${point.lng.toFixed(3)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function corridorVias(from: GeoPoint, to: GeoPoint) {
  const direct = Math.max(haversineKm(from, to), 0.4);
  return ACCRA_CORRIDORS.map((via) => {
    const loop = haversineKm(from, via) + haversineKm(via, to);
    return { via, ratio: loop / direct };
  })
    .filter((item) => item.ratio >= 1.08 && item.ratio <= 1.55)
    .sort((a, b) => a.ratio - b.ratio)
    .map((item) => item.via);
}

function offsetAt(from: GeoPoint, to: GeoPoint, t: number, km: number, sign: 1 | -1) {
  const anchor = {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
  const ahead = {
    lat: anchor.lat + (to.lat - from.lat),
    lng: anchor.lng + (to.lng - from.lng),
  };
  return offsetFromMid(anchor, ahead, km, sign);
}

async function collectCandidateRoutes(from: GeoPoint, to: GeoPoint, issues: Issue[]) {
  const provider = getRoutingProvider();
  const direct = await provider.route(from, to);
  const fastestGeom = [...direct].sort((a, b) => a.durationMin - b.durationMin)[0]?.geometry ?? [];
  const vias = uniqueVias(
    [
      ...corridorVias(from, to).slice(0, 3),
      offsetAt(from, to, 0.4, 2.6, 1),
      offsetAt(from, to, 0.4, 2.6, -1),
      offsetAt(from, to, 0.65, 3.1, 1),
      offsetAt(from, to, 0.65, 3.1, -1),
      ...hazardDetourVias(fastestGeom, issues),
    ],
    from,
    to,
  ).slice(0, 6);

  const detours = await Promise.all(
    vias.map(async (via) => {
      try {
        return await provider.route(from, to, [via]);
      } catch {
        return [] as RawRoute[];
      }
    }),
  );
  const merged = dedupeRoutes([...direct, ...detours.flat()]);
  if (merged.length === 0) return mockRoutes(from, to);
  const fastestMin = Math.min(...merged.map((route) => route.durationMin));
  return merged.filter((route) => route.durationMin <= fastestMin * 2.4);
}

export async function planTrip(
  from: GeoPoint,
  to: GeoPoint,
  issues: Issue[],
  preference: RoutePreference,
) {
  if (!inGreaterAccra(from) || !inGreaterAccra(to)) {
    throw new Error("Road Assist only plans trips inside Greater Accra.");
  }
  const raw = await collectCandidateRoutes(from, to, issues);
  const scored = scoreRoutes(raw, issues, preference);
  const fastest = scored.filter((route) => route.emphasis === "fastest");
  const condition = scored.filter((route) => route.emphasis === "condition");
  const rest = scored.filter((route) => route.emphasis !== "fastest" && route.emphasis !== "condition");
  const preferred = pickRecommendedRoute(scored, preference);
  const ordered = [...fastest, ...condition.filter((route) => !fastest.some((item) => item.id === route.id)), ...rest];
  if (!preferred) return ordered;
  return [preferred, ...ordered.filter((route) => route.id !== preferred.id)].slice(0, 4);
}
