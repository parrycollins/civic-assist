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
    return issue.reporterDisplayName?.trim() || "CivicGH Citizen";
  }
  return "Anonymous CivicGH Citizen";
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
  const completedAgencies = new Set(completed.map((i) => i.agencyId));
  const verified = completed.filter((i) => i.status === "verified").length;
  return {
    reported: issues.length,
    resolved: completed.length,
    verified,
    documented: completed.filter((i) => i.evidence.some((e) => e.stage === "after")).length,
    agencies: agencies.size,
    completedAgencies: completedAgencies.size,
    awaiting: issues.filter((i) => i.status === "resolved").length,
    disputed: issues.filter((i) => i.status === "disputed").length,
    verifiedShare: completed.length ? Math.round((verified / completed.length) * 100) : 0,
  };
}

export function archiveImpact(issues: Issue[]) {
  const completed = completedWorks(issues);
  const verified = completed.filter((i) => i.status === "verified").length;
  const agencies = new Set(completed.map((i) => i.agencyId));
  return {
    completed: completed.length,
    verified,
    agencies: agencies.size,
    verifiedShare: completed.length ? Math.round((verified / completed.length) * 100) : 0,
  };
}

export function workMilestones(issue: Issue) {
  const stamp = (...statuses: Array<Issue["timeline"][number]["status"]>) =>
    issue.timeline.find((event) => statuses.includes(event.status))?.timestamp;
  const reportedAt = stamp("reported") ?? issue.reportedAt;
  const assignedAt = stamp("assigned", "agency_accepted");
  const startedAt = stamp("work_started", "in_progress");
  const completedStamp = stamp("resolved") ?? (isCompletedWork(issue) ? completedAt(issue) : undefined);
  const verifiedAt = stamp("citizen_verified", "verified");
  return [
    { key: "reported", title: "Reported", at: reportedAt, done: Boolean(reportedAt) },
    { key: "assigned", title: "Assigned", at: assignedAt, done: Boolean(assignedAt) },
    { key: "started", title: "Work Started", at: startedAt, done: Boolean(startedAt) },
    { key: "completed", title: "Completed", at: completedStamp, done: isCompletedWork(issue) },
    {
      key: "verified",
      title: "Citizen Verified",
      at: issue.status === "verified" ? verifiedAt ?? completedStamp : undefined,
      done: issue.status === "verified",
    },
  ] as const;
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
  year: number | "all" | "older";
};

export function filterCompleted(issues: Issue[], filters: CompletedFilters) {
  return completedWorks(issues).filter((issue) => {
    if (filters.category !== "all" && issue.category !== filters.category) return false;
    if (filters.municipality !== "all" && issue.location.municipality !== filters.municipality) return false;
    if (filters.area !== "all" && issue.location.area !== filters.area) return false;
    if (filters.agencyId !== "all" && issue.agencyId !== filters.agencyId) return false;
    if (filters.year === "older") {
      if (parseISO(completedAt(issue)).getUTCFullYear() >= 2023) return false;
    } else if (filters.year !== "all" && parseISO(completedAt(issue)).getUTCFullYear() !== filters.year) {
      return false;
    }
    return true;
  });
}

export function locationsFrom(issues: Issue[]) {
  const municipalities = [...new Set(issues.map((i) => i.location.municipality))].sort();
  const areas = [...new Set(issues.map((i) => i.location.area))].sort();
  return { municipalities, areas };
}

export function olderCompletedCount(issues: Issue[]) {
  return completedWorks(issues).filter((issue) => parseISO(completedAt(issue)).getUTCFullYear() < 2023).length;
}

export function agenciesWithCompleted(issues: Issue[]) {
  const completed = completedWorks(issues);
  const ids = [...new Set(completed.map((issue) => issue.agencyId))];
  return ids
    .map((id) => {
      const agency = AGENCIES.find((item) => item.id === id);
      const mine = completed.filter((issue) => issue.agencyId === id);
      const verified = mine.filter((issue) => issue.status === "verified").length;
      return {
        id,
        name: agency?.name ?? "Agency",
        shortName: agency?.shortName ?? agency?.name ?? "Agency",
        completed: mine.length,
        verified,
        verifiedShare: mine.length ? Math.round((verified / mine.length) * 100) : 0,
      };
    })
    .sort((a, b) => b.completed - a.completed);
}

export function agencyIdsFrom(issues: Issue[]) {
  return AGENCIES.filter((a) => issues.some((i) => i.agencyId === a.id));
}

export function resolutionLabel(issue: Issue) {
  const days = resolutionDays(issue);
  if (days === null) return "—";
  return days === 1 ? "1 day" : `${days} days`;
}
