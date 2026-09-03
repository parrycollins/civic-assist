"use client";

import { useEffect } from "react";
import { Circle, MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster";
import "leaflet.heat";
import { clusterIcon, issueDivIcon } from "@/components/map/markers";
import { ACCRA_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import type { GeoPoint, Issue, ScoredRoute } from "@/lib/types";

type LeafletWithPlugins = typeof L & {
  markerClusterGroup: (options?: Record<string, unknown>) => L.FeatureGroup;
  heatLayer: (
    latlngs: Array<[number, number, number?]>,
    options?: Record<string, unknown>,
  ) => L.Layer;
};

const LP = L as LeafletWithPlugins;

function FlyTo({ target, zoom }: { target?: GeoPoint | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], zoom ?? Math.max(map.getZoom(), 14), { duration: 1.1 });
  }, [target, zoom, map]);
  return null;
}

function IssueLayers({
  issues,
  viewMode,
  onSelect,
}: {
  issues: Issue[];
  viewMode: "markers" | "density";
  onSelect: (id: string) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (viewMode === "density") {
      const heat = LP.heatLayer(
        issues.map((i) => [i.location.lat, i.location.lng, i.status === "verified" ? 0.4 : 0.9]),
        {
          radius: 28,
          blur: 22,
          maxZoom: 17,
          gradient: { 0.2: "#86efac", 0.45: "#facc15", 0.7: "#f97316", 1: "#b91c1c" },
        },
      );
      map.addLayer(heat);
      return () => {
        map.removeLayer(heat);
      };
    }

    const cluster = LP.markerClusterGroup({
      maxClusterRadius: 56,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (c: { getChildCount: () => number }) => clusterIcon(c.getChildCount()),
    });

    for (const issue of issues) {
      const marker = L.marker([issue.location.lat, issue.location.lng], {
        icon: issueDivIcon(issue.status, issue.title),
        title: `${issue.title} (${issue.status})`,
        alt: `${issue.title}, ${issue.status.replace(/_/g, " ")}`,
      });
      marker.on("click", () => onSelect(issue.id));
      cluster.addLayer(marker);
    }
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
    };
  }, [issues, viewMode, map, onSelect]);

  return null;
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
}) {
  return (
    <MapContainer
      center={[ACCRA_CENTER.lat, ACCRA_CENTER.lng]}
      zoom={DEFAULT_ZOOM}
      className="civic-leaflet h-full w-full"
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FlyTo target={flyTo} zoom={navigating ? 16 : 14} />
      <IssueLayers issues={issues} viewMode={viewMode} onSelect={onSelect} />
      {userApprox && (
        <Circle
          center={[userApprox.lat, userApprox.lng]}
          radius={(radiusKm ?? 5) * 1000}
          pathOptions={{ color: "#0f766e", weight: 1, fillOpacity: 0.08 }}
        />
      )}
      {userApprox && (
        <Circle
          center={[userApprox.lat, userApprox.lng]}
          radius={280}
          pathOptions={{ color: "#0f766e", weight: 2, fillColor: "#14b8a6", fillOpacity: 0.25 }}
        />
      )}
      {routes?.map((route) => {
        const selected = route.id === selectedRouteId;
        return (
          <Polyline
            key={route.id}
            positions={route.geometry.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{
              color: route.floodWarning ? "#b91c1c" : selected ? "#0f766e" : "#64748b",
              weight: selected ? 6 : 4,
              opacity: selected ? 0.95 : 0.45,
            }}
          />
        );
      })}
    </MapContainer>
  );
}
