"use client";

import { useMemo, useState } from "react";
import { Filter, Layers, LocateFixed, X } from "lucide-react";
import { AGENCIES } from "@/data/agencies";
import { AREAS } from "@/data/areas";
import { CATEGORY_META, RADIUS_OPTIONS, STATUS_META } from "@/lib/constants";
import { ISSUE_STATUSES } from "@/lib/types";
import type { Category, IssueStatus, MapFilters, MapLayerMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const selectClass =
  "h-10 w-full rounded-2xl border-0 bg-secondary px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
      <div className="pointer-events-auto mx-auto flex max-w-xl flex-col gap-3">
        <form
          className="flex items-center gap-2 rounded-[1.4rem] bg-card/95 p-2 shadow-[0_16px_40px_-22px_rgb(16_32_24/0.45)] backdrop-blur-xl"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit(filters.searchQuery);
          }}
        >
          <input
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search Accra areas, streets, categories"
            className="h-11 flex-1 bg-transparent px-3 text-sm outline-none"
            aria-label="Search the civic map"
          />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative grid size-11 place-items-center rounded-2xl bg-secondary"
            aria-label="Filters"
          >
            <Filter className="size-4" />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-gold-foreground">
                {activeFilters}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onNearMe}
            className={cn(
              "grid size-11 place-items-center rounded-2xl",
              filters.nearMe ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
            aria-label="Near me"
          >
            <LocateFixed className="size-4" />
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["problems", "Problems"],
              ["progress", "In progress"],
              ["completed", "Completed"],
            ] as [MapLayerMode, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ ...filters, layerMode: id })}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur",
                filters.layerMode === id ? "bg-primary text-primary-foreground" : "bg-card/90 text-foreground",
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
            className="inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-xs font-bold shadow-sm"
          >
            <Layers className="size-3.5" />
            {filters.viewMode === "density" ? "Density" : "Markers"}
          </button>
          <span className="self-center rounded-full bg-card/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {resultCount} shown
          </span>
        </div>
        {extra}

        {open && (
          <div className="rounded-[1.5rem] bg-card p-4 shadow-[0_20px_50px_-24px_rgb(16_32_24/0.4)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-heading font-bold">Filters</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status">
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
              </Field>
              <Field label="Category">
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
                      {meta.icon} {meta.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Agency">
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
              </Field>
              <Field label="Area">
                <select
                  className={selectClass}
                  value={filters.areaId}
                  onChange={(e) => onChange({ ...filters, areaId: e.target.value })}
                >
                  <option value="all">All areas</option>
                  {AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date">
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
              </Field>
              {filters.datePreset === "custom" && (
                <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                  <input type="date" className={selectClass} value={filters.customFrom ?? ""} onChange={(e) => onChange({ ...filters, customFrom: e.target.value })} />
                  <input type="date" className={selectClass} value={filters.customTo ?? ""} onChange={(e) => onChange({ ...filters, customTo: e.target.value })} />
                </div>
              )}
              {filters.nearMe && (
                <Field label="Near me radius">
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
                </Field>
              )}
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Pins show the problem, not the reporter. Near Me uses an approximate area.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
      {label}
      {children}
    </label>
  );
}
