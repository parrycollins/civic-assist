import L from "leaflet";
import { STATUS_META } from "@/lib/constants";
import type { IssueStatus } from "@/lib/types";

function shapePath(shape: (typeof STATUS_META)[IssueStatus]["shape"]) {
  switch (shape) {
    case "diamond":
      return `<polygon points="18,2 34,18 18,34 2,18" />`;
    case "square":
      return `<rect x="5" y="5" width="26" height="26" rx="3" />`;
    case "hex":
      return `<polygon points="18,2 32,10 32,26 18,34 4,26 4,10" />`;
    case "triangle":
      return `<polygon points="18,3 34,32 2,32" />`;
    case "badge":
      return `<path d="M18 2l4.2 8.6 9.5 1.4-6.8 6.7 1.6 9.4L18 23.8 9.5 28.1l1.6-9.4-6.8-6.7 9.5-1.4z" />`;
    default:
      return `<circle cx="18" cy="18" r="15" />`;
  }
}

export function issueDivIcon(status: IssueStatus, title: string) {
  const meta = STATUS_META[status];
  const html = `
    <div class="civic-marker" title="${title} — ${meta.label}">
      <svg width="36" height="42" viewBox="0 0 36 42" aria-hidden="true">
        <g transform="translate(0,0)" fill="${meta.color}" stroke="#111" stroke-width="1.6">
          ${shapePath(meta.shape)}
        </g>
        <text x="18" y="${meta.shape === "triangle" ? 24 : 22}" text-anchor="middle" font-size="${meta.glyph === "⚠" ? 11 : 13}" font-weight="700" fill="#fff" font-family="system-ui">${meta.glyph}</text>
      </svg>
      <span class="civic-marker-label">${meta.short}</span>
    </div>`;
  return L.divIcon({
    className: "civic-divicon",
    html,
    iconSize: [36, 48],
    iconAnchor: [18, 42],
    popupAnchor: [0, -36],
  });
}

export const clusterIcon = (count: number) =>
  L.divIcon({
    className: "civic-divicon",
    html: `<div class="civic-cluster" aria-label="${count} reports in this area">${count}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
