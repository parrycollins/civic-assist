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

export type UserRole = "citizen" | "agency";

export interface IssueLocation {
  lat: number;
  lng: number;
  area: string;
  municipality: string;
  publicLabel: string;
}

export interface TimelineEvent {
  id: string;
  status: string;
  label: string;
  timestamp: string;
  actor: string;
}

export interface Evidence {
  id: string;
  stage: string;
  photoKey: string;
  timestamp: string;
  uploadedBy: string;
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
  agencyName: string;
  status: IssueStatus;
  reporterCount: number;
  timeline: TimelineEvent[];
  evidence: Evidence[];
  createdByMe?: boolean;
  reporterVisibility?: "named" | "anonymous";
}

export interface User {
  name: string;
  email: string;
  role: UserRole;
  recognition: "named" | "anonymous";
}

export function statusLayer(status: IssueStatus): "problems" | "progress" | "completed" {
  if (status === "resolved" || status === "verified") return "completed";
  if (status === "assigned" || status === "in_progress") return "progress";
  return "problems";
}

export function statusLabel(status: IssueStatus): string {
  switch (status) {
    case "reported":
      return "Reported";
    case "under_review":
      return "Under Review";
    case "assigned":
      return "Assigned";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Awaiting Citizen Verification";
    case "verified":
      return "Citizen Verified";
    case "disputed":
      return "Disputed";
  }
}

export function categoryLabel(category: Category): string {
  switch (category) {
    case "roads":
      return "Roads";
    case "flooding":
      return "Flooding";
    case "drainage":
      return "Drainage";
    case "waste":
      return "Waste";
    case "streetlights":
      return "Streetlights";
    case "water":
      return "Water";
    case "public_infrastructure":
      return "Public infrastructure";
    case "other":
      return "Other";
  }
}

export function categoryIcon(category: Category): string {
  switch (category) {
    case "roads":
      return "🕳️";
    case "flooding":
      return "🌊";
    case "drainage":
      return "🚰";
    case "waste":
      return "🗑️";
    case "streetlights":
      return "💡";
    case "water":
      return "💧";
    case "public_infrastructure":
      return "🏛️";
    case "other":
      return "📍";
  }
}
