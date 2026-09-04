import L from "leaflet";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import { FORWARD_THRESHOLD, isForwardedToAgency } from "@/lib/dispatch";
import type { Category, Issue, IssueStatus } from "@/lib/types";

export function issueDivIcon(status: IssueStatus, title: string, category?: Category, issue?: Pick<Issue, "complaintCount" | "reporterCount" | "forwardedToAgency">) {
  const meta = STATUS_META[status];
  const icon = category ? CATEGORY_META[category].icon : meta.glyph;
  const gathering = issue && !isForwardedToAgency(issue as Issue);
  const count = issue ? (issue.complaintCount ?? issue.reporterCount) : undefined;
  const short = gathering && count != null ? `${count}/${FORWARD_THRESHOLD}` : meta.short;
  const color = gathering ? "#d4a017" : meta.color;
  const html = `
    <div class="civic-marker" title="${title} — ${gathering ? "Stored in CivicGH Cloud" : meta.label}">
      <div class="civic-marker-core" style="background:${color}">${icon}</div>
      <span class="civic-marker-label">${short}</span>
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
