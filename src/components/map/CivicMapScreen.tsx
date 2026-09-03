"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { findPlaces } from "@/data/areas";
import { CATEGORY_META } from "@/lib/constants";
import { DEFAULT_FILTERS, filterIssues } from "@/lib/filters";
import { approximateLocation } from "@/lib/geo";
import { useCivicStore } from "@/lib/store";
import type { GeoPoint, Issue, MapFilters } from "@/lib/types";
import { AgencyPerformanceCard } from "@/components/map/AgencyPerformanceCard";
import { CivicMapCanvas } from "@/components/map/CivicMapCanvas";
import { IssueSheet } from "@/components/map/IssueSheet";
import { MapToolbar } from "@/components/map/MapToolbar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CivicMapScreen({
  mode = "citizen",
  agencyId,
}: {
  mode?: "citizen" | "agency";
  agencyId?: string;
}) {
  const issues = useCivicStore((s) => s.issues);
  const [filters, setFilters] = useState<MapFilters>({
    ...DEFAULT_FILTERS,
    agencyId: agencyId ?? "all",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<GeoPoint | null>(null);
  const [userApprox, setUserApprox] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);

  const scoped = useMemo(() => {
    const base = mode === "agency" && agencyId ? issues.filter((i) => i.agencyId === agencyId) : issues;
    return filterIssues(base, filters, userApprox ?? undefined);
  }, [issues, filters, userApprox, mode, agencyId]);

  const selected = scoped.find((i) => i.id === selectedId) ?? issues.find((i) => i.id === selectedId) ?? null;

  const onSearchSubmit = useCallback(
    (q: string) => {
      const hits = findPlaces(q);
      const categoryHit = Object.entries(CATEGORY_META).find(
        ([id, meta]) =>
          meta.label.toLowerCase().includes(q.toLowerCase()) || id === q.toLowerCase(),
      );
      if (hits[0]) {
        setFlyTo(hits[0].center);
        setFilters((f) => ({ ...f, areaId: hits[0].id, searchQuery: q }));
        toast.success(`Moved to ${hits[0].name}`);
        return;
      }
      if (categoryHit) {
        setFilters((f) => ({
          ...f,
          categories: [categoryHit[0] as Issue["category"]],
          searchQuery: q,
        }));
        toast.success(`Showing ${categoryHit[1].label} reports`);
        return;
      }
      setFilters((f) => ({ ...f, searchQuery: q, areaId: "all" }));
    },
    [],
  );

  const onNearMe = useCallback(() => {
    if (filters.nearMe) {
      setFilters((f) => ({ ...f, nearMe: false }));
      setUserApprox(null);
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Location is not available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const approx = approximateLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setUserApprox(approx);
        setFlyTo(approx);
        setFilters((f) => ({ ...f, nearMe: true }));
        setLocating(false);
        toast.message("Showing an approximate area around you — not your exact location.");
      },
      () => {
        // Demo fallback: East Legon, so the feature is usable without GPS permission.
        const approx = approximateLocation({ lat: 5.6364, lng: -0.1588 });
        setUserApprox(approx);
        setFlyTo(approx);
        setFilters((f) => ({ ...f, nearMe: true }));
        setLocating(false);
        toast.message("Location permission unavailable. Using East Legon as a demo nearby area.");
      },
      { enableHighAccuracy: false, timeout: 6000 },
    );
  }, [filters.nearMe]);

  return (
    <div className="relative h-full min-h-0 w-full">
      <CivicMapCanvas
        issues={scoped}
        viewMode={filters.viewMode}
        onSelect={setSelectedId}
        flyTo={flyTo}
        userApprox={filters.nearMe ? userApprox : null}
        radiusKm={filters.nearRadiusKm}
      />
      <MapToolbar
        filters={filters}
        onChange={setFilters}
        onSearchSubmit={onSearchSubmit}
        onNearMe={onNearMe}
        locating={locating}
        resultCount={scoped.length}
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/road-assist"
              className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "shadow-sm")}
            >
              Road Assist
            </Link>
            {mode === "agency" && (
              <span className="rounded-full bg-background/90 px-2 py-1 text-[11px] shadow-sm">
                Agency map — assigned complaints only
              </span>
            )}
          </div>
        }
      />
      {filters.agencyId !== "all" && (
        <div className="pointer-events-none absolute right-3 bottom-24 z-[400] max-w-sm sm:bottom-6">
          <div className="pointer-events-auto">
            <AgencyPerformanceCard agencyId={filters.agencyId} issues={issues} />
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-20 left-3 z-[400] max-w-[16rem] rounded-xl border bg-background/90 p-2 text-[11px] leading-4 text-muted-foreground shadow sm:bottom-6">
        Markers use colour and shape: circle new, diamond review, square assigned, hexagon work, badge verified,
        triangle disputed.
      </div>
      <IssueSheet issue={selected} open={Boolean(selected)} onOpenChange={(o) => !o && setSelectedId(null)} />
    </div>
  );
}
