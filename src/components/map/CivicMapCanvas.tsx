"use client";

import { useEffect, useRef, useState } from "react";
import { ACCRA_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import type { GeoPoint, Issue, ScoredRoute } from "@/lib/types";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type LType from "leaflet";

function polylineColor(route: ScoredRoute, selected: boolean) {
  if (route.floodWarning && !selected) return "#c45c26";
  if (route.emphasis === "condition") return selected ? "#d4a017" : "#c9a227";
  if (route.emphasis === "fastest") return selected ? "#0d4f3c" : "#2d6a4f";
  if (selected) return "#0d4f3c";
  return "#8a8478";
}

export function CivicMapCanvas({
  issues,
  viewMode,
  onSelect,
  flyTo,
  userApprox,
  radiusKm,
  routes,
  selectedRouteId,
  navigating,
  onMapClick,
  onSelectRoute,
}: {
  issues: Issue[];
  viewMode: "markers" | "density";
  onSelect: (id: string) => void;
  flyTo?: GeoPoint | null;
  userApprox?: GeoPoint | null;
  radiusKm?: number;
  routes?: ScoredRoute[];
  selectedRouteId?: string;
  navigating?: boolean;
  onMapClick?: (point: GeoPoint) => void;
  onSelectRoute?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const issuesLayerRef = useRef<LayerGroup | null>(null);
  const extrasLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof LType | null>(null);
  const onSelectRef = useRef(onSelect);
  const onMapClickRef = useRef(onMapClick);
  const onSelectRouteRef = useRef(onSelectRoute);
  const issuesRef = useRef(issues);
  const viewModeRef = useRef(viewMode);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    onSelectRef.current = onSelect;
    onMapClickRef.current = onMapClick;
    onSelectRouteRef.current = onSelectRoute;
    issuesRef.current = issues;
    viewModeRef.current = viewMode;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let timer = 0;

    void (async () => {
      try {
        const leafletMod = await import("leaflet");
        const icons = await import("@/components/map/markers");
        const L = leafletMod.default;
        if (cancelled || !containerRef.current) return;
        leafletRef.current = L;

        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: true,
        }).setView([ACCRA_CENTER.lat, ACCRA_CENTER.lng], DEFAULT_ZOOM);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const issuesLayer = L.layerGroup().addTo(map);
        const extrasLayer = L.layerGroup().addTo(map);
        mapRef.current = map;
        issuesLayerRef.current = issuesLayer;
        extrasLayerRef.current = extrasLayer;

        const drawIssues = () => {
          issuesLayer.clearLayers();
          const current = issuesRef.current;
          const mode = viewModeRef.current;
          const zoom = map.getZoom();

          if (mode === "density") {
            for (const issue of current) {
              L.circleMarker([issue.location.lat, issue.location.lng], {
                radius: 16,
                color: "#b91c1c",
                fillColor: "#f97316",
                fillOpacity: 0.28,
                weight: 0,
              }).addTo(issuesLayer);
            }
            return;
          }

          const showIndividuals = zoom >= 14;
          const cell = 0.09 / 2 ** Math.max(0, zoom - 10);
          const buckets = new Map<string, Issue[]>();
          for (const issue of current) {
            const key = showIndividuals
              ? issue.id
              : `${Math.round(issue.location.lat / cell)}:${Math.round(issue.location.lng / cell)}`;
            const list = buckets.get(key) ?? [];
            list.push(issue);
            buckets.set(key, list);
          }

          for (const group of buckets.values()) {
            if (group.length === 1) {
              const issue = group[0];
              const marker = L.marker([issue.location.lat, issue.location.lng], {
                icon: icons.issueDivIcon(issue.status, issue.title, issue.category, issue),
                title: `${issue.title} (${issue.status})`,
              });
              marker.on("click", (event) => {
                L.DomEvent.stopPropagation(event);
                onSelectRef.current(issue.id);
              });
              marker.addTo(issuesLayer);
              continue;
            }
            const lat = group.reduce((s, i) => s + i.location.lat, 0) / group.length;
            const lng = group.reduce((s, i) => s + i.location.lng, 0) / group.length;
            const marker = L.marker([lat, lng], {
              icon: icons.clusterIcon(group.length),
              title: `${group.length} reports in this area`,
            });
            marker.on("click", () => {
              map.flyTo([lat, lng], Math.min(zoom + 2, 16), { duration: 0.6 });
            });
            marker.addTo(issuesLayer);
          }
        };

        map.on("click", (event) => {
          onMapClickRef.current?.({ lat: event.latlng.lat, lng: event.latlng.lng });
        });
        map.on("zoomend", drawIssues);
        map.on("moveend", drawIssues);
        (map as LeafletMap & { _civicDraw?: () => void })._civicDraw = drawIssues;
        drawIssues();

        const resize = () => map.invalidateSize();
        requestAnimationFrame(resize);
        timer = window.setTimeout(resize, 200);
        observer = new ResizeObserver(resize);
        observer.observe(containerRef.current);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current as (LeafletMap & { _civicDraw?: () => void }) | null;
    map?._civicDraw?.();
  }, [issues, viewMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.flyTo([flyTo.lat, flyTo.lng], navigating ? 16 : Math.max(map.getZoom(), 14), { duration: 1 });
  }, [flyTo, navigating]);

  useEffect(() => {
    const map = mapRef.current;
    const extras = extrasLayerRef.current;
    const L = leafletRef.current;
    if (!map || !extras || !L) return;
    extras.clearLayers();
    if (userApprox) {
      L.circle([userApprox.lat, userApprox.lng], {
        radius: (radiusKm ?? 5) * 1000,
        color: "#0f766e",
        weight: 1,
        fillOpacity: 0.08,
      }).addTo(extras);
      L.circle([userApprox.lat, userApprox.lng], {
        radius: 280,
        color: "#0f766e",
        weight: 2,
        fillColor: "#14b8a6",
        fillOpacity: 0.25,
      }).addTo(extras);
    }
    const ordered = [...(routes ?? [])].sort((a, b) => Number(a.id === selectedRouteId) - Number(b.id === selectedRouteId));
    ordered.forEach((route) => {
      const selected = route.id === selectedRouteId;
      const line = L.polyline(
        route.geometry.map((p) => [p.lat, p.lng] as [number, number]),
        {
          color: polylineColor(route, selected),
          weight: selected ? 7 : 4,
          opacity: selected ? 0.95 : 0.55,
        },
      );
      line.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        onSelectRouteRef.current?.(route.id);
      });
      line.addTo(extras);
    });
  }, [userApprox, radiusKm, routes, selectedRouteId, status]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || navigating || !routes?.length || status !== "ready") return;
    const pts = routes.flatMap((route) => route.geometry);
    if (pts.length < 2) return;
    const bounds = L.latLngBounds(pts.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { paddingTopLeft: [28, 210], paddingBottomRight: [28, 260], maxZoom: 14 });
  }, [routes, navigating, status]);

  return (
    <div className="civic-map-shell">
      <div ref={containerRef} className="civic-map-root" />
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[#dce8dc]/70 text-sm text-muted-foreground">
          Drawing Accra map…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-muted p-6 text-center text-sm">
          The map library failed to load. Refresh the page.
        </div>
      )}
    </div>
  );
}
