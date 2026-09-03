import type { Issue, MapFilters, MapLayerMode } from "./types";
import { STATUS_META } from "./constants";
import { haversineKm } from "./geo";
import { parseISO } from "date-fns";

function inDateRange(iso: string, filters: MapFilters) {
  if (filters.datePreset === "all") return true;
  const t = parseISO(iso).getTime();
  const now = new Date("2026-09-03T12:00:00Z").getTime();
  const day = 86_400_000;
  if (filters.datePreset === "today") return now - t <= day;
  if (filters.datePreset === "week") return now - t <= 7 * day;
  if (filters.datePreset === "month") return now - t <= 30 * day;
  if (filters.datePreset === "quarter") return now - t <= 90 * day;
  if (filters.datePreset === "custom") {
    if (filters.customFrom && t < new Date(filters.customFrom).getTime()) return false;
    if (filters.customTo && t > new Date(filters.customTo).getTime() + day) return false;
  }
  return true;
}

export function matchesLayer(issue: Issue, layer: MapLayerMode) {
  if (layer === "all") return true;
  return STATUS_META[issue.status].layer === layer;
}

export function filterIssues(
  issues: Issue[],
  filters: MapFilters,
  userApprox?: { lat: number; lng: number },
) {
  const q = filters.searchQuery.trim().toLowerCase();
  return issues.filter((issue) => {
    if (!matchesLayer(issue, filters.layerMode)) return false;
    if (filters.statuses !== "all" && !filters.statuses.includes(issue.status)) return false;
    if (filters.categories !== "all" && !filters.categories.includes(issue.category)) return false;
    if (filters.agencyId !== "all" && issue.agencyId !== filters.agencyId) return false;
    if (filters.areaId !== "all") {
      const areaName = filters.areaId.replace(/-/g, " ");
      if (
        !issue.location.area.toLowerCase().includes(areaName) &&
        issue.location.municipality.toLowerCase() !== areaName
      ) {
        // also allow id match via public label
        if (!issue.location.publicLabel.toLowerCase().includes(areaName)) return false;
      }
    }
    if (!inDateRange(issue.reportedAt, filters)) return false;
    if (q) {
      const hay = `${issue.title} ${issue.category} ${issue.location.area} ${issue.location.street ?? ""} ${issue.location.municipality} ${issue.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.nearMe && userApprox) {
      if (haversineKm(issue.location, userApprox) > filters.nearRadiusKm) return false;
    }
    return true;
  });
}

export const DEFAULT_FILTERS: MapFilters = {
  statuses: "all",
  categories: "all",
  agencyId: "all",
  datePreset: "all",
  areaId: "all",
  layerMode: "all",
  viewMode: "markers",
  nearMe: false,
  nearRadiusKm: 5,
  searchQuery: "",
};
