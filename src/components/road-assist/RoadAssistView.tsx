"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Layers, LocateFixed, Navigation } from "lucide-react";
import { toast } from "sonner";
import { findPlaces } from "@/data/areas";
import { HAZARD_META } from "@/lib/constants";
import { approximateLocation } from "@/lib/geo";
import { planTrip } from "@/lib/routing";
import { pickRecommendedRoute } from "@/lib/scoring";
import { useCivicStore } from "@/lib/store";
import type { GeoPoint, RoadHazard, RoutePreference, ScoredRoute } from "@/lib/types";
import { CivicMapCanvas } from "@/components/map/CivicMapCanvas";
import { IssueSheet } from "@/components/map/IssueSheet";
import { cn } from "@/lib/utils";

const QUICK: { id: RoadHazard; label: string }[] = [
  { id: "pothole", label: "Pothole" },
  { id: "flooding", label: "Flooding" },
  { id: "obstruction", label: "Obstruction" },
  { id: "construction", label: "Construction" },
  { id: "closure", label: "Closure" },
  { id: "traffic_light", label: "Traffic light" },
  { id: "other", label: "Other" },
];

type Layers = {
  problems: boolean;
  flooding: boolean;
  potholes: boolean;
  incidents: boolean;
  activeWork: boolean;
  completed: boolean;
  density: boolean;
  myLocation: boolean;
};

const DEFAULT_LAYERS: Layers = {
  problems: true,
  flooding: true,
  potholes: true,
  incidents: true,
  activeWork: true,
  completed: true,
  density: false,
  myLocation: true,
};

function routeTitle(route: ScoredRoute, routes: ScoredRoute[], recommended?: ScoredRoute) {
  const fastest = [...routes].sort((a, b) => a.durationMin - b.durationMin)[0];
  if (route.id === recommended?.id) return "Recommended";
  if (route.id === fastest?.id) return "Fastest";
  return "Alternative";
}

function conditionLine(route: ScoredRoute) {
  if (route.floodWarning) return "⚠️ Flooding reported nearby";
  if (route.hazards.length > 0) return `⚠️ ${route.hazards.length} road issue${route.hazards.length === 1 ? "" : "s"}`;
  if (route.conditionScore >= 75) return "🟢 Good road condition";
  return "🟡 Fair road condition";
}

export function RoadAssistView() {
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const addIssue = useCivicStore((s) => s.addIssue);
  const addRoadFeedback = useCivicStore((s) => s.addRoadFeedback);
  const confirmIssue = useCivicStore((s) => s.confirmIssue);

  const [originQuery, setOriginQuery] = useState("Current location");
  const [destQuery, setDestQuery] = useState("");
  const [origin, setOrigin] = useState<GeoPoint>({ lat: 5.6052, lng: -0.1668 });
  const [dest, setDest] = useState<GeoPoint | null>(null);
  const [routes, setRoutes] = useState<ScoredRoute[]>([]);
  const [preference, setPreference] = useState<RoutePreference>("balanced");
  const [selectedRouteId, setSelectedRouteId] = useState<string>();
  const [navigating, setNavigating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [layers, setLayers] = useState<Layers>(DEFAULT_LAYERS);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<GeoPoint | null>(origin);

  const visibleIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (!issue.isRoadRelated) return false;
      if (layers.density) return true;
      if (!layers.completed && (issue.status === "resolved" || issue.status === "verified")) return false;
      if (!layers.activeWork && (issue.status === "in_progress" || issue.status === "assigned")) return false;
      if (issue.roadHazard === "flooding" && !layers.flooding) return false;
      if (issue.roadHazard === "pothole" && !layers.potholes) return false;
      if ((issue.roadHazard === "accident" || issue.roadHazard === "traffic_light") && !layers.incidents) return false;
      if (!layers.problems && ["reported", "under_review", "disputed"].includes(issue.status)) return false;
      return true;
    });
  }, [issues, layers]);

  const chosen = routes.find((r) => r.id === selectedRouteId) ?? pickRecommendedRoute(routes, preference);

  async function searchDestination(q: string) {
    const local = findPlaces(q);
    if (local[0]) {
      setDest(local[0].center);
      setDestQuery(local[0].name);
      setFlyTo(local[0].center);
      return local[0].center;
    }
    toast.error("No matching Accra place. Try East Legon, Accra Mall, or Spintex Road.");
    return null;
  }

  async function useCurrentOrigin() {
    if (!navigator.geolocation) {
      toast.message("Using Kotoka Airport as a demo start.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const approx = approximateLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setOrigin(approx);
        setOriginQuery("Approximate current area");
        setFlyTo(approx);
      },
      () => toast.message("GPS unavailable. Using Kotoka International Airport as start."),
    );
  }

  async function compareRoutes(to = dest) {
    if (!to) {
      toast.error("Choose a destination first.");
      return;
    }
    setLoading(true);
    try {
      const scored = await planTrip(origin, to, issues, preference);
      setRoutes(scored);
      const rec = pickRecommendedRoute(scored, preference);
      setSelectedRouteId(rec?.id);
      setFlyTo(to);
      if (rec?.floodWarning) {
        toast.warning("Flooding reported on this route.");
      }
    } catch {
      toast.error("Could not calculate routes.");
    } finally {
      setLoading(false);
    }
  }

  function startNav() {
    if (!chosen) return;
    setNavigating(true);
    setFlyTo(origin);
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(
        `Starting navigation. ${chosen.recommendation ?? chosen.summary}. Keep your attention on the road.`,
      );
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
    toast.message("Navigation started. Keep the phone mounted — a passenger should handle reports.");
  }

  function endNav() {
    setNavigating(false);
    setFeedbackOpen(true);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function quickReport(hazard: RoadHazard) {
    if (!user) {
      toast.error("Sign in to report.");
      return;
    }
    const point = approximateLocation(origin);
    const meta = HAZARD_META[hazard];
    addIssue({
      title: `${meta.label} reported while travelling`,
      category: meta.category,
      description: `Quick Road Assist report: ${meta.label} near the current approximate travel area.`,
      lat: point.lat,
      lng: point.lng,
      isRoadRelated: true,
      roadHazard: hazard,
      severity: hazard === "flooding" || hazard === "closure" ? "high" : "medium",
    });
    setQuickOpen(false);
    toast.success("Road problem reported. Other travellers will see it after confirmation.");
  }

  const selected = issues.find((i) => i.id === selectedIssue) ?? null;

  return (
    <div className="relative h-full min-h-0">
      <CivicMapCanvas
        issues={visibleIssues}
        viewMode={layers.density ? "density" : "markers"}
        onSelect={setSelectedIssue}
        flyTo={flyTo}
        userApprox={layers.myLocation ? origin : null}
        radiusKm={1}
        routes={routes}
        selectedRouteId={chosen?.id}
        navigating={navigating}
      />

      {!navigating && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[400] p-3">
          <div className="pointer-events-auto mx-auto max-w-xl space-y-3">
            <div className="rounded-[1.6rem] bg-card/95 p-4 shadow-[0_16px_40px_-22px_rgb(16_32_24/0.45)] backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-heading text-lg font-extrabold">Road Assist</p>
                  <p className="text-xs text-muted-foreground">Premium civic navigation</p>
                </div>
                <Link href="/map" className="text-xs font-bold text-primary">
                  Civic Map
                </Link>
              </div>
              <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Where are you going?</p>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void searchDestination(destQuery).then((p) => p && compareRoutes(p));
                }}
              >
                <input
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  placeholder="East Legon, Accra Mall, Spintex…"
                  className="h-13 h-12 flex-1 rounded-2xl bg-secondary px-4 text-base outline-none"
                  aria-label="Search destination"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"
                  aria-label="Find routes"
                >
                  <Navigation className="size-5" />
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  value={originQuery}
                  onChange={(e) => setOriginQuery(e.target.value)}
                  onBlur={() => {
                    const hit = findPlaces(originQuery)[0];
                    if (hit) {
                      setOrigin(hit.center);
                      setOriginQuery(hit.name);
                    }
                  }}
                  className="h-10 min-w-0 flex-1 rounded-2xl bg-secondary px-3 text-sm outline-none"
                  aria-label="Starting location"
                />
                <button
                  type="button"
                  onClick={useCurrentOrigin}
                  className="inline-flex h-10 items-center gap-1 rounded-2xl bg-secondary px-3 text-xs font-bold"
                >
                  <LocateFixed className="size-3.5" />
                  Current
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(
                  [
                    ["balanced", "Recommended"],
                    ["fastest", "Fastest"],
                    ["condition", "Best condition"],
                  ] as [RoutePreference, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setPreference(id);
                      if (routes.length) {
                        const rec = pickRecommendedRoute(routes, id);
                        setSelectedRouteId(rec?.id);
                      }
                    }}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[11px] font-bold",
                      preference === id ? "bg-primary text-primary-foreground" : "bg-secondary",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {navigating && (
        <div className="absolute inset-x-0 top-0 z-[500] bg-gold px-4 py-3 text-center text-sm font-bold text-gold-foreground">
          You are navigating. Do not interact while driving. Ask a passenger to report hazards, or stop first.
        </div>
      )}

      {!navigating && routes.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-[400] max-h-[46vh] overflow-y-auto p-3 md:bottom-4">
          <div className="pointer-events-auto mx-auto grid max-w-xl gap-2">
            {chosen?.floodWarning && (
              <div className="rounded-[1.3rem] bg-red-50 p-3 text-sm dark:bg-red-950/50">
                ⚠️ Flooding reported on this route. An alternative with fewer flood reports is highlighted when
                available.
              </div>
            )}
            {routes.map((route) => {
              const title = routeTitle(route, routes, chosen);
              const recommended = title === "Recommended";
              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                  className={cn(
                    "rounded-[1.4rem] bg-card p-4 text-left card-lift",
                    recommended && "ring-2 ring-gold bg-primary text-primary-foreground",
                    !recommended && route.id === chosen?.id && "ring-2 ring-primary",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-heading text-lg font-extrabold">{title}</p>
                    <p className="text-sm font-bold">
                      {route.durationMin} min · {route.distanceKm} km
                    </p>
                  </div>
                  <p className={cn("mt-1 text-sm", recommended ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {conditionLine(route)}
                  </p>
                </button>
              );
            })}
            <button
              type="button"
              onClick={startNav}
              disabled={!chosen}
              className="h-12 rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
            >
              Start navigation
            </button>
          </div>
        </div>
      )}

      {navigating && (
        <div className="absolute inset-x-0 bottom-20 z-[400] p-3 md:bottom-4">
          <div className="mx-auto max-w-md space-y-3 rounded-[1.6rem] bg-card/95 p-4 shadow-xl">
            <p className="font-heading text-2xl font-extrabold">
              {chosen?.durationMin} min · {chosen?.distanceKm} km
            </p>
            <p className="text-sm text-muted-foreground">{chosen?.summary}</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="h-11 flex-1 rounded-2xl bg-secondary text-sm font-bold"
                onClick={() => setQuickOpen(true)}
              >
                Report road problem
              </button>
              <button type="button" className="h-11 flex-1 rounded-2xl bg-primary text-sm font-bold text-primary-foreground" onClick={endNav}>
                End trip
              </button>
            </div>
          </div>
        </div>
      )}

      {!navigating && (
        <div className="pointer-events-none absolute top-[42%] right-3 z-[400]">
          <div className="pointer-events-auto grid gap-2">
            <button
              type="button"
              onClick={() => setLayersOpen((v) => !v)}
              className="grid size-12 place-items-center rounded-2xl bg-card/95 shadow-lg"
              aria-label="Layers"
            >
              <Layers className="size-5" />
            </button>
            {layersOpen && (
              <div className="w-[12.5rem] space-y-1 rounded-[1.3rem] bg-card/95 p-3 text-[11px] shadow-xl">
                <p className="mb-1 font-heading font-bold">Layers</p>
                {(
                  [
                    ["problems", "🚧 Road Problems"],
                    ["flooding", "🌊 Flooding"],
                    ["potholes", "🕳️ Potholes"],
                    ["incidents", "🚦 Traffic / incidents"],
                    ["activeWork", "🔵 Active Road Work"],
                    ["completed", "🟢 Completed Road Work"],
                    ["density", "🔥 Problem Density"],
                    ["myLocation", "📍 My Location"],
                  ] as [keyof Layers, string][]
                ).map(([id, label]) => (
                  <label key={id} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-1">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={layers[id]}
                      onChange={(e) => setLayers((l) => ({ ...l, [id]: e.target.checked }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {quickOpen && (
        <div className="absolute inset-0 z-[600] flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[1.7rem] bg-card p-5">
            <p className="font-heading text-lg font-extrabold">Quick road report</p>
            <p className="text-xs leading-5 text-muted-foreground">
              Designed for a passenger, or when the vehicle is stopped. GPS, time, and area are attached automatically.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUICK.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  className="h-12 rounded-2xl bg-secondary text-sm font-bold"
                  onClick={() => quickReport(q.id)}
                >
                  {HAZARD_META[q.id].icon} {q.label}
                </button>
              ))}
            </div>
            <button type="button" className="mt-3 h-11 w-full rounded-2xl text-sm font-bold" onClick={() => setQuickOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {feedbackOpen && (
        <div className="absolute inset-0 z-[600] flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-3 rounded-[1.7rem] bg-card p-5">
            <p className="font-heading text-lg font-extrabold">How was the road?</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["good", "👍 Good"],
                  ["average", "😐 Average"],
                  ["poor", "👎 Poor"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className="h-12 rounded-2xl bg-secondary text-sm font-bold"
                  onClick={() => {
                    addRoadFeedback({
                      rating: id,
                      routeSummary: chosen?.summary ?? "Trip",
                    });
                    if (id === "good") {
                      chosen?.hazards.forEach((h) => confirmIssue(h.issueId, false));
                    }
                    if (id === "poor") {
                      chosen?.hazards.forEach((h) => confirmIssue(h.issueId, true));
                    }
                    toast.success("Thanks — this helps road-condition confidence.");
                    setFeedbackOpen(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs">Optionally report a new problem:</p>
            <div className="flex flex-wrap gap-1">
              {QUICK.slice(0, 5).map((q) => (
                <button
                  key={q.id}
                  type="button"
                  className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold"
                  onClick={() => {
                    quickReport(q.id);
                    setFeedbackOpen(false);
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <button type="button" className="h-11 w-full rounded-2xl text-sm font-bold" onClick={() => setFeedbackOpen(false)}>
              Skip
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-x-0 top-1/2 z-[450] -translate-y-1/2 text-center">
          <p className="inline-flex rounded-full bg-card px-4 py-2 text-sm font-bold shadow-lg">Finding safer routes…</p>
        </div>
      )}

      <IssueSheet issue={selected} open={Boolean(selected)} onOpenChange={(o) => !o && setSelectedIssue(null)} />
    </div>
  );
}
