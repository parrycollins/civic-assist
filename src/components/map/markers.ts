import L from "leaflet";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import type { Category, IssueStatus } from "@/lib/types";

export function issueDivIcon(status: IssueStatus, title: string, category?: Category) {
  const meta = STATUS_META[status];
  const icon = category ? CATEGORY_META[category].icon : meta.glyph;
  const html = `
    <div class="civic-marker" title="${title} — ${meta.label}">
      <div class="civic-marker-core" style="background:${meta.color}">${icon}</div>
      <span class="civic-marker-label">${meta.short}</span>
    </div>`;
  return L.divIcon({
    className: "civic-divicon",
    html,
    iconSize: [38, 52],
    iconAnchor: [19, 46],
    popupAnchor: [0, -36],
  });
}

export const clusterIcon = (count: number) =>
  L.divIcon({
    className: "civic-divicon",
    html: `<div class="civic-cluster" aria-label="${count} reports in this area">${count}</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
