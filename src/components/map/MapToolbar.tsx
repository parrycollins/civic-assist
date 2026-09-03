"use client";

import { useMemo, useState } from "react";
import { Filter, LocateFixed, X } from "lucide-react";
import { AGENCIES } from "@/data/agencies";
import { AREAS } from "@/data/areas";
import { CATEGORY_META, RADIUS_OPTIONS, STATUS_META } from "@/lib/constants";
import { ISSUE_STATUSES } from "@/lib/types";
import type { Category, IssueStatus, MapFilters, MapLayerMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const selectClass =
  "h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function MapToolbar({
  filters,
  onChange,
  onSearchSubmit,
  onNearMe,
  locating,
  resultCount,
  extra,
}: {
  filters: MapFilters;
  onChange: (next: MapFilters) => void;
  onSearchSubmit: (q: string) => void;
  onNearMe: () => void;
  locating?: boolean;
  resultCount: number;
  extra?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const activeFilters = useMemo(() => {
    let n = 0;
    if (filters.statuses !== "all") n += 1;
    if (filters.categories !== "all") n += 1;
    if (filters.agencyId !== "all") n += 1;
    if (filters.datePreset !== "all") n += 1;
    if (filters.areaId !== "all") n += 1;
    if (filters.nearMe) n += 1;
    return n;
  }, [filters]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[400] p-3 sm:p-4">
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-2">
        <form
          className="flex items-center gap-2 rounded-2xl border bg-background/95 p-1.5 shadow-lg backdrop-blur"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit(filters.searchQuery);
          }}
        >
          <Input
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search areas, streets, neighborhoods, categories…"
            className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
            aria-label="Search the civic map"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
            <Filter className="size-4" />
            Filters
            {activeFilters > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {activeFilters}
              </span>
            )}
          </Button>
          <Button type="button" variant={filters.nearMe ? "default" : "outline"} size="sm" onClick={onNearMe}>
            <LocateFixed className="size-4" />
            {locating ? "Locating…" : "Near Me"}
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", "All"],
              ["problems", "Problems"],
              ["progress", "Work in Progress"],
              ["completed", "Completed Work"],
            ] as [MapLayerMode, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ ...filters, layerMode: id })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur",
                filters.layerMode === id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/90",
              )}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                viewMode: filters.viewMode === "markers" ? "density" : "markers",
              })
            }
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur",
              filters.viewMode === "density"
                ? "border-orange-600 bg-orange-600 text-white"
                : "border-border bg-background/90",
            )}
          >
            {filters.viewMode === "density" ? "Problem Density View" : "Markers View"}
          </button>
          <span className="self-center rounded-full bg-background/90 px-2 py-1 text-[11px] text-muted-foreground shadow-sm">
            {resultCount} shown
          </span>
        </div>
        {extra}

        {open && (
          <div className="rounded-2xl border bg-background/95 p-3 shadow-xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Map filters</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium">
                Status
                <select
                  className={selectClass}
                  value={filters.statuses === "all" ? "all" : filters.statuses[0]}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      statuses: e.target.value === "all" ? "all" : [e.target.value as IssueStatus],
                    })
                  }
                >
                  <option value="all">All</option>
                  {ISSUE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium">
                Category
                <select
                  className={selectClass}
                  value={filters.categories === "all" ? "all" : filters.categories[0]}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      categories: e.target.value === "all" ? "all" : [e.target.value as Category],
                    })
                  }
                >
                  <option value="all">All</option>
                  {Object.entries(CATEGORY_META).map(([id, meta]) => (
                    <option key={id} value={id}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium">
                Agency
                <select
                  className={selectClass}
                  value={filters.agencyId}
                  onChange={(e) => onChange({ ...filters, agencyId: e.target.value })}
                >
                  <option value="all">All agencies</option>
                  {AGENCIES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium">
                Area / municipality
                <select
                  className={selectClass}
                  value={filters.areaId}
                  onChange={(e) => onChange({ ...filters, areaId: e.target.value })}
                >
                  <option value="all">All areas</option>
                  {AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.municipality})
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium">
                Date reported
                <select
                  className={selectClass}
                  value={filters.datePreset}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      datePreset: e.target.value as MapFilters["datePreset"],
                    })
                  }
                >
                  <option value="all">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="quarter">Last 3 months</option>
                  <option value="custom">Custom range</option>
                </select>
              </label>
              {filters.datePreset === "custom" && (
                <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                  <input
                    type="date"
                    className={selectClass}
                    value={filters.customFrom ?? ""}
                    onChange={(e) => onChange({ ...filters, customFrom: e.target.value })}
                  />
                  <input
                    type="date"
                    className={selectClass}
                    value={filters.customTo ?? ""}
                    onChange={(e) => onChange({ ...filters, customTo: e.target.value })}
                  />
                </div>
              )}
              {filters.nearMe && (
                <label className="grid gap-1 text-xs font-medium">
                  Near me radius
                  <select
                    className={selectClass}
                    value={filters.nearRadiusKm}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        nearRadiusKm: Number(e.target.value) as MapFilters["nearRadiusKm"],
                      })
                    }
                  >
                    {RADIUS_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r} km
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Public pins show the problem, not who reported it. Near Me uses an approximate area — never your exact
              location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
