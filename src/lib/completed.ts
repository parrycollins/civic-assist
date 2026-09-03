import { parseISO } from "date-fns";
import { AGENCIES } from "@/data/agencies";
import { STATUS_META } from "@/lib/constants";
import { resolutionDays } from "@/lib/performance";
import type { Category, Evidence, Issue, User } from "@/lib/types";

export function isCompletedWork(issue: Issue) {
  return STATUS_META[issue.status].layer === "completed";
}

export function completedWorks(issues: Issue[]) {
  return issues
    .filter(isCompletedWork)
    .sort((a, b) => completedAt(b).localeCompare(completedAt(a)));
}

export function completedAt(issue: Issue) {
  const event = [...issue.timeline].reverse().find((e) => e.status === "resolved" || e.status === "verified");
  return event?.timestamp ?? issue.lastUpdateAt;
}

export function workStartedAt(issue: Issue) {
  const event = issue.timeline.find((e) => e.status === "in_progress" || e.status === "work_started");
  return event?.timestamp;
}

export function publicReporterLabel(issue: Issue, viewer?: User | null) {
  const named =
    issue.reporterVisibility === "named" ||
    (viewer && issue.createdById === viewer.id && viewer.recognition === "named");
  if (named) {
    if (viewer && issue.createdById === viewer.id) return viewer.displayName?.trim() || viewer.name;
    return issue.reporterDisplayName?.trim() || "Citizen Reporter";
  }
  return "Citizen Reporter";
}

export function verificationLabel(issue: Issue) {
  if (issue.status === "verified") return "Citizen Verified";
  if (issue.status === "resolved") return "Awaiting Citizen Verification";
  if (issue.status === "disputed") return "Resolution Disputed";
  return STATUS_META[issue.status].label;
}

export function firstEvidence(issue: Issue, stage: Evidence["stage"]) {
  return issue.evidence.find((e) => e.stage === stage);
}

export function videosFor(issue: Issue) {
  return issue.evidence.filter((e) => e.kind === "video" || Boolean(e.videoDataUrl));
}

export function civicImpact(issues: Issue[]) {
  const completed = issues.filter(isCompletedWork);
  const agencies = new Set(issues.map((i) => i.agencyId));
  return {
    reported: issues.length,
    resolved: completed.length,
    verified: issues.filter((i) => i.status === "verified").length,
    documented: completed.filter((i) => i.evidence.some((e) => e.stage === "after")).length,
    agencies: agencies.size,
    awaiting: issues.filter((i) => i.status === "resolved").length,
    disputed: issues.filter((i) => i.status === "disputed").length,
  };
}

export function yearArchive(issues: Issue[]) {
  const completed = completedWorks(issues);
  const years = [2026, 2025, 2024, 2023];
  return years.map((year) => ({
    year,
    count: completed.filter((issue) => parseISO(completedAt(issue)).getUTCFullYear() === year).length,
  }));
}

export function citizenImpact(issues: Issue[], user: User | null, myIssueIds: string[]) {
  if (!user) {
    return { submitted: 0, resolved: 0, active: 0, other: 0, mine: [] as Issue[] };
  }
  const mine = issues.filter((i) => i.createdById === user.id || myIssueIds.includes(i.id));
  const resolved = mine.filter(isCompletedWork);
  const active = mine.filter((i) => !isCompletedWork(i) && i.status !== "disputed");
  return {
    submitted: mine.length,
    resolved: resolved.length,
    active: active.length,
    other: mine.length - resolved.length - active.length,
    mine,
  };
}

export type CompletedFilters = {
  category: Category | "all";
  municipality: string | "all";
  area: string | "all";
  agencyId: string | "all";
  year: number | "all";
};

export function filterCompleted(issues: Issue[], filters: CompletedFilters) {
  return completedWorks(issues).filter((issue) => {
    if (filters.category !== "all" && issue.category !== filters.category) return false;
    if (filters.municipality !== "all" && issue.location.municipality !== filters.municipality) return false;
    if (filters.area !== "all" && issue.location.area !== filters.area) return false;
    if (filters.agencyId !== "all" && issue.agencyId !== filters.agencyId) return false;
    if (filters.year !== "all" && parseISO(completedAt(issue)).getUTCFullYear() !== filters.year) return false;
    return true;
  });
}

export function locationsFrom(issues: Issue[]) {
  const municipalities = [...new Set(issues.map((i) => i.location.municipality))].sort();
  const areas = [...new Set(issues.map((i) => i.location.area))].sort();
  return { municipalities, areas };
}

export function agencyIdsFrom(issues: Issue[]) {
  return AGENCIES.filter((a) => issues.some((i) => i.agencyId === a.id));
}

export function resolutionLabel(issue: Issue) {
  const days = resolutionDays(issue);
  if (days === null) return "—";
  return days === 1 ? "1 day" : `${days} days`;
}
