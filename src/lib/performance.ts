import { differenceInDays, parseISO } from "date-fns";
import type { AgencyPerformance, Issue } from "./types";
import { STATUS_META } from "./constants";
import { isForwardedToAgency } from "./dispatch";

export function isOverdue(issue: Issue, now = new Date("2026-09-03T12:00:00Z")) {
  if (!issue.dueAt) return false;
  const layer = STATUS_META[issue.status].layer;
  if (layer === "completed") return false;
  return parseISO(issue.dueAt).getTime() < now.getTime();
}

export function resolutionDays(issue: Issue) {
  const resolved = issue.timeline.find((e) => e.status === "resolved" || e.status === "verified");
  if (!resolved) return null;
  return Math.max(0, differenceInDays(parseISO(resolved.timestamp), parseISO(issue.reportedAt)));
}

export function agencyPerformance(issues: Issue[], agencyId: string): AgencyPerformance {
  const mine = issues.filter((i) => i.agencyId === agencyId && isForwardedToAgency(i));
  const resolved = mine.filter((i) => STATUS_META[i.status].layer === "completed");
  const days = resolved.map(resolutionDays).filter((d): d is number => d !== null);
  const avg = days.length ? days.reduce((a, b) => a + b, 0) / days.length : 0;
  return {
    agencyId,
    received: mine.length,
    resolved: resolved.length,
    resolutionRate: mine.length ? (resolved.length / mine.length) * 100 : 0,
    averageResolutionDays: Math.round(avg * 10) / 10,
    citizenVerified: mine.filter((i) => i.status === "verified").length,
    overdue: mine.filter((i) => isOverdue(i)).length,
    inProgress: mine.filter((i) => i.status === "in_progress" || i.status === "assigned").length,
    newComplaints: mine.filter((i) => i.status === "reported" || i.status === "under_review").length,
  };
}

export function platformStats(issues: Issue[]) {
  const completed = issues.filter((i) => STATUS_META[i.status].layer === "completed");
  const open = issues.filter((i) => STATUS_META[i.status].layer !== "completed");
  return {
    total: issues.length,
    open: open.length,
    completed: completed.length,
    verified: issues.filter((i) => i.status === "verified").length,
    road: issues.filter((i) => i.isRoadRelated).length,
  };
}

export function categoryBreakdown(issues: Issue[]) {
  const counts = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.category] = (acc[issue.category] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}

export function monthlyTrend(issues: Issue[], months = 6) {
  const now = new Date("2026-09-03T12:00:00Z");
  return Array.from({ length: months }, (_, i) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - i), 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const received = issues.filter((issue) => {
      const d = parseISO(issue.reportedAt);
      return d.getUTCFullYear() === date.getUTCFullYear() && d.getUTCMonth() === date.getUTCMonth();
    }).length;
    const resolved = issues.filter((issue) => {
      const stamp = issue.timeline.find((e) => e.status === "resolved" || e.status === "verified")?.timestamp;
      if (!stamp) return false;
      const d = parseISO(stamp);
      return d.getUTCFullYear() === date.getUTCFullYear() && d.getUTCMonth() === date.getUTCMonth();
    }).length;
    return {
      key,
      label: date.toLocaleString("en-GB", { month: "short" }),
      received,
      resolved,
    };
  });
}

export function performanceBand(rate: number) {
  if (rate >= 85) return "Excellent";
  if (rate >= 70) return "Strong";
  if (rate >= 50) return "Developing";
  return "Needs attention";
}
