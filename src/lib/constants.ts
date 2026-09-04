import type { Category, IssueStatus, MapLayerMode, RoadHazard, Severity } from "./types";

export const APP_NAME = "CivicGH";
export const SEED_VERSION = 2;
export const ACCRA_CENTER = { lat: 5.6037, lng: -0.187 };
export const DEFAULT_ZOOM = 12;

export const STATUS_META: Record<
  IssueStatus,
  {
    label: string;
    color: string;
    fill: string;
    shape: "circle" | "diamond" | "square" | "hex" | "badge" | "triangle";
    glyph: string;
    short: string;
    layer: Exclude<MapLayerMode, "all">;
  }
> = {
  reported: {
    label: "Reported",
    color: "#B91C1C",
    fill: "#FEE2E2",
    shape: "circle",
    glyph: "!",
    short: "New",
    layer: "problems",
  },
  under_review: {
    label: "Under Review",
    color: "#C2410C",
    fill: "#FFEDD5",
    shape: "diamond",
    glyph: "?",
    short: "Review",
    layer: "problems",
  },
  assigned: {
    label: "Assigned",
    color: "#5B21B6",
    fill: "#EDE9FE",
    shape: "square",
    glyph: "A",
    short: "Assigned",
    layer: "progress",
  },
  in_progress: {
    label: "In Progress",
    color: "#1D4ED8",
    fill: "#DBEAFE",
    shape: "hex",
    glyph: "W",
    short: "Work",
    layer: "progress",
  },
  resolved: {
    label: "Resolved",
    color: "#15803D",
    fill: "#DCFCE7",
    shape: "circle",
    glyph: "✓",
    short: "Done",
    layer: "completed",
  },
  verified: {
    label: "Citizen-verified",
    color: "#065F46",
    fill: "#A7F3D0",
    shape: "badge",
    glyph: "✓",
    short: "Verified",
    layer: "completed",
  },
  disputed: {
    label: "Disputed",
    color: "#92400E",
    fill: "#FDE68A",
    shape: "triangle",
    glyph: "⚠",
    short: "Dispute",
    layer: "problems",
  },
};

export const CATEGORY_META: Record<
  Category,
  { label: string; icon: string; roadDefault?: RoadHazard }
> = {
  roads: { label: "Roads", icon: "🕳️", roadDefault: "pothole" },
  flooding: { label: "Flooding", icon: "🌊", roadDefault: "flooding" },
  drainage: { label: "Drainage", icon: "🚰" },
  waste: { label: "Waste", icon: "🗑️" },
  streetlights: { label: "Streetlights", icon: "💡", roadDefault: "traffic_light" },
  water: { label: "Water", icon: "💧" },
  public_infrastructure: { label: "Public infrastructure", icon: "🏛️" },
  other: { label: "Other", icon: "📍" },
};

export const HAZARD_META: Record<RoadHazard, { label: string; icon: string; category: Category }> = {
  pothole: { label: "Pothole", icon: "🕳️", category: "roads" },
  flooding: { label: "Flooding", icon: "🌊", category: "flooding" },
  obstruction: { label: "Road obstruction", icon: "🚧", category: "roads" },
  construction: { label: "Construction", icon: "🏗️", category: "roads" },
  closure: { label: "Road closure", icon: "⛔", category: "roads" },
  traffic_light: { label: "Damaged traffic light", icon: "🚦", category: "streetlights" },
  damaged_road: { label: "Damaged road", icon: "🛣️", category: "roads" },
  accident: { label: "Verified incident", icon: "⚠️", category: "roads" },
  other: { label: "Other road hazard", icon: "📍", category: "other" },
};

export const SEVERITY_META: Record<Severity, { label: string; weight: number }> = {
  low: { label: "Low", weight: 1 },
  medium: { label: "Medium", weight: 2 },
  high: { label: "High", weight: 3 },
  critical: { label: "Critical", weight: 5 },
};

export const DEMO_ACCOUNTS = [
  {
    email: "ama@civicgh.gh",
    password: "civic2026",
    role: "citizen" as const,
    name: "Ama Mensah",
    area: "East Legon",
  },
  {
    email: "officer@ama.gov.gh",
    password: "agency2026",
    role: "agency" as const,
    name: "Kwame Asante",
    agencyId: "ama",
  },
  {
    email: "roads@dur.gov.gh",
    password: "agency2026",
    role: "agency" as const,
    name: "Efua Boateng",
    agencyId: "dur",
  },
];

export const RADIUS_OPTIONS = [1, 5, 10, 25] as const;
