"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import { findPlaces } from "@/data/areas";
import { HAZARD_META } from "@/lib/constants";
import { approximateLocation } from "@/lib/geo";
import { planTrip } from "@/lib/routing";
import { pickRecommendedRoute } from "@/lib/scoring";
import { useCivicStore } from "@/lib/store";
import type { GeoPoint, RoadHazard, RoutePreference, ScoredRoute } from "@/lib/types";
import { IssueSheet } from "@/components/map/IssueSheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CivicMapCanvas = dynamic(
  () => import("@/components/map/CivicMapCanvas").then((m) => m.CivicMapCanvas),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center">Loading map…</div> },
);

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
          <div className="pointer-events-auto mx-auto max-w-xl space-y-2 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="font-heading font-semibold">Road Assist</p>
              <Link href="/map" className="text-xs font-medium text-primary">
                Civic Map
              </Link>
            </div>
            <Input
              value={originQuery}
              onChange={(e) => setOriginQuery(e.target.value)}
              placeholder="Starting location"
              onBlur={() => {
                const hit = findPlaces(originQuery)[0];
                if (hit) {
                  setOrigin(hit.center);
                  setOriginQuery(hit.name);
                }
              }}
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={useCurrentOrigin}>
                Use current location
              </Button>
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void searchDestination(destQuery).then((p) => p && compareRoutes(p));
              }}
            >
              <Input
                value={destQuery}
                onChange={(e) => setDestQuery(e.target.value)}
                placeholder="Search destination — East Legon, Accra Mall…"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Routing…" : "Go"}
              </Button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["fastest", "Fastest Route"],
                  ["condition", "Best Road Condition"],
                  ["balanced", "Balanced Route"],
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
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                    preference === id ? "border-primary bg-primary text-primary-foreground" : "bg-background",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {navigating && (
        <div className="absolute inset-x-0 top-0 z-[500] bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-amber-950">
          You are navigating. Do not interact while driving. Ask a passenger to report hazards, or stop first.
        </div>
      )}

      {!navigating && routes.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-[400] max-h-[40vh] overflow-y-auto p-3 md:bottom-4">
          <div className="pointer-events-auto mx-auto grid max-w-xl gap-2">
            {chosen?.recommendation && (
              <div className="rounded-xl border border-emerald-700/30 bg-emerald-50 p-3 text-sm dark:bg-emerald-950/50">
                <p className="font-semibold">Recommended Route</p>
                <p>{chosen.recommendation}</p>
              </div>
            )}
            {chosen?.floodWarning && (
              <div className="rounded-xl border border-red-700/40 bg-red-50 p-3 text-sm">
                ⚠️ Flooding reported on this route. An alternative with fewer flood reports is highlighted when
                available. CivicGH does not treat old flood complaints as proof that a road is flooded today.
              </div>
            )}
            {routes.map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRouteId(route.id)}
                className={cn(
                  "rounded-xl border bg-background p-3 text-left shadow-sm",
                  route.id === chosen?.id && "ring-2 ring-primary",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold">{route.label}</p>
                  <p className="text-sm">
                    {route.durationMin} min — {route.distanceKm} km
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{route.summary}</p>
                <p className="mt-1 text-xs">Road condition {route.conditionScore}/100</p>
                {route.hazards.length > 0 && (
                  <ul className="mt-1 text-xs">
                    {route.hazards.slice(0, 4).map((h) => (
                      <li key={h.issueId}>
                        {HAZARD_META[h.hazard].icon} {h.title}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            ))}
            <Button size="lg" onClick={startNav} disabled={!chosen}>
              Start navigation
            </Button>
          </div>
        </div>
      )}

      {navigating && (
        <div className="absolute inset-x-0 bottom-20 z-[400] p-3 md:bottom-4">
          <div className="mx-auto max-w-md space-y-2 rounded-2xl bg-background/95 p-3 shadow-xl">
            <p className="text-lg font-semibold">
              {chosen?.durationMin} min · {chosen?.distanceKm} km
            </p>
            <p className="text-sm text-muted-foreground">{chosen?.summary}</p>
            <div className="flex gap-2">
              <Button className="flex-1" variant="secondary" onClick={() => setQuickOpen(true)}>
                Report road problem
              </Button>
              <Button className="flex-1" variant="outline" onClick={endNav}>
                End trip
              </Button>
            </div>
          </div>
        </div>
      )}

      {!navigating && (
        <div className="pointer-events-none absolute top-1/3 right-3 z-[400] hidden max-w-[11rem] sm:block">
          <div className="pointer-events-auto space-y-1 rounded-xl border bg-background/95 p-2 text-[11px] shadow">
            <p className="font-semibold">Layers</p>
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
              <label key={id} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={layers[id]}
                  onChange={(e) => setLayers((l) => ({ ...l, [id]: e.target.checked }))}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      {quickOpen && (
        <div className="absolute inset-0 z-[600] flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-4">
            <p className="font-semibold">Quick road report</p>
            <p className="text-xs text-muted-foreground">
              Designed for a passenger, or when the vehicle is stopped. GPS, time, and area are attached automatically.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUICK.map((q) => (
                <Button key={q.id} variant="outline" onClick={() => quickReport(q.id)}>
                  {HAZARD_META[q.id].icon} {q.label}
                </Button>
              ))}
            </div>
            <Button className="mt-3 w-full" variant="ghost" onClick={() => setQuickOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {feedbackOpen && (
        <div className="absolute inset-0 z-[600] flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-3 rounded-2xl bg-background p-4">
            <p className="font-semibold">How was the road?</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["good", "👍 Good"],
                  ["average", "😐 Average"],
                  ["poor", "👎 Poor"],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  variant="outline"
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
                </Button>
              ))}
            </div>
            <p className="text-xs">Optionally report a new problem:</p>
            <div className="flex flex-wrap gap-1">
              {QUICK.slice(0, 5).map((q) => (
                <button
                  key={q.id}
                  type="button"
                  className={cn(buttonVariants({ size: "xs", variant: "secondary" }))}
                  onClick={() => {
                    quickReport(q.id);
                    setFeedbackOpen(false);
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setFeedbackOpen(false)}>
              Skip
            </Button>
          </div>
        </div>
      )}

      <IssueSheet issue={selected} open={Boolean(selected)} onOpenChange={(o) => !o && setSelectedIssue(null)} />
    </div>
  );
}
