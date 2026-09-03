export const ISSUE_STATUSES = [
  "reported",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "verified",
  "disputed",
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const CATEGORIES = [
  "roads",
  "flooding",
  "drainage",
  "waste",
  "streetlights",
  "water",
  "public_infrastructure",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const ROAD_HAZARDS = [
  "pothole",
  "flooding",
  "obstruction",
  "construction",
  "closure",
  "traffic_light",
  "damaged_road",
  "accident",
  "other",
] as const;

export type RoadHazard = (typeof ROAD_HAZARDS)[number];

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const EVIDENCE_STAGES = ["before", "during", "after"] as const;
export type EvidenceStage = (typeof EVIDENCE_STAGES)[number];

export type UserRole = "citizen" | "agency";

export type MapLayerMode = "problems" | "progress" | "completed" | "all";
export type MapViewMode = "markers" | "density";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface IssueLocation extends GeoPoint {
  area: string;
  street?: string;
  municipality: string;
  /** Public-facing approximate location. Never a private residence. */
  publicLabel: string;
}

export interface TimelineEvent {
  id: string;
  status: IssueStatus | "agency_accepted" | "work_started" | "citizen_verified" | "reopened";
  label: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole | "system";
  note?: string;
}

export interface Evidence {
  id: string;
  complaintId: string;
  stage: EvidenceStage;
  photoKey: string;
  imageDataUrl?: string;
  timestamp: string;
  uploadedBy: string;
  uploadedByRole: UserRole;
  agencyId?: string;
  description?: string;
}

export interface Issue {
  id: string;
  title: string;
  category: Category;
  description: string;
  photoKey: string;
  location: IssueLocation;
  reportedAt: string;
  agencyId: string;
  status: IssueStatus;
  reporterCount: number;
  affectedCount?: number;
  lastUpdateAt: string;
  timeline: TimelineEvent[];
  evidence: Evidence[];
  isRoadRelated: boolean;
  roadHazard?: RoadHazard;
  severity: Severity;
  supportingReports: number;
  denials: number;
  confidence: number;
  roadSegmentId?: string;
  dueAt?: string;
  verificationCount: number;
  createdById?: string;
  /** Offset applied so public pins are not exact private GPS. */
  privacyOffset: GeoPoint;
}

export interface Agency {
  id: string;
  name: string;
  shortName: string;
  type: string;
  municipality: string;
  jurisdiction: string[];
}

export interface RoadHistoryEvent {
  id: string;
  month: string;
  label: string;
  detail: string;
  issueId?: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  municipality: string;
  area: string;
  polyline: [number, number][];
  history: RoadHistoryEvent[];
}

export interface Area {
  id: string;
  name: string;
  municipality: string;
  center: GeoPoint;
  aliases: string[];
}

export interface Place {
  id: string;
  name: string;
  kind: "area" | "street" | "landmark" | "neighborhood";
  center: GeoPoint;
  aliases: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId?: string;
  area?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  issueId?: string;
  createdAt: string;
  read: boolean;
}

export interface RoadFeedback {
  id: string;
  rating: "good" | "average" | "poor";
  routeSummary: string;
  createdAt: string;
  problems?: RoadHazard[];
}

export interface MapFilters {
  statuses: IssueStatus[] | "all";
  categories: Category[] | "all";
  agencyId: string | "all";
  datePreset: "all" | "today" | "week" | "month" | "quarter" | "custom";
  customFrom?: string;
  customTo?: string;
  areaId: string | "all";
  layerMode: MapLayerMode;
  viewMode: MapViewMode;
  nearMe: boolean;
  nearRadiusKm: 1 | 5 | 10 | 25;
  searchQuery: string;
}

export interface RouteHazard {
  issueId: string;
  title: string;
  hazard: RoadHazard;
  severity: Severity;
  status: IssueStatus;
  confidence: number;
  distanceAlongKm: number;
}

export interface ScoredRoute {
  id: string;
  label: string;
  durationMin: number;
  distanceKm: number;
  geometry: GeoPoint[];
  hazards: RouteHazard[];
  conditionScore: number;
  floodWarning: boolean;
  summary: string;
  recommendation?: string;
}

export type RoutePreference = "fastest" | "condition" | "balanced";

export interface AgencyPerformance {
  agencyId: string;
  received: number;
  resolved: number;
  resolutionRate: number;
  averageResolutionDays: number;
  citizenVerified: number;
  overdue: number;
  inProgress: number;
  newComplaints: number;
}
