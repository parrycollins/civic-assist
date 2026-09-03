import { differenceInDays, parseISO } from "date-fns";
import { SEVERITY_META, STATUS_META } from "./constants";
import type { Issue, RoadHazard, ScoredRoute } from "./types";

const HAZARD_PENALTY: Record<RoadHazard, number> = {
  pothole: 8,
  flooding: 18,
  obstruction: 12,
  construction: 7,
  closure: 40,
  traffic_light: 6,
  damaged_road: 10,
  accident: 16,
  other: 5,
};

export function recencyWeight(iso: string, now = new Date()) {
  const days = Math.max(0, differenceInDays(now, parseISO(iso)));
  // Influence halves about every 3 weeks unless the issue is still active.
  return Math.exp(-days / 21);
}

export function issueConfidence(issue: Issue) {
  const confirms = issue.supportingReports + issue.verificationCount;
  const denials = issue.denials;
  const raw = (confirms - denials * 1.4) / Math.max(3, confirms + denials);
  const recency = recencyWeight(issue.lastUpdateAt);
  const statusBoost =
    issue.status === "verified" || issue.status === "in_progress" ? 0.15 : 0;
  const resolvedPenalty =
    issue.status === "resolved" || issue.status === "verified" ? -0.6 : 0;
  return Math.max(0, Math.min(1, 0.35 + raw * 0.5 + recency * 0.2 + statusBoost + resolvedPenalty));
}

export function isStaleUnresolved(issue: Issue, now = new Date()) {
  if (STATUS_META[issue.status].layer === "completed") return false;
  return recencyWeight(issue.lastUpdateAt, now) < 0.25 && issue.supportingReports < 3;
}

export function shouldTreatAsActiveHazard(issue: Issue) {
  if (!issue.isRoadRelated) return false;
  if (issue.status === "resolved" || issue.status === "verified") return false;
  if (isStaleUnresolved(issue)) return false;
  return issueConfidence(issue) >= 0.28;
}

export function roadConditionScore(issues: Issue[], now = new Date()) {
  let score = 100;
  let repairBonus = 0;
  for (const issue of issues) {
    if (!issue.isRoadRelated) continue;
    const weight = recencyWeight(issue.lastUpdateAt, now) * issueConfidence(issue);
    if (issue.status === "resolved" || issue.status === "verified") {
      repairBonus += 4 * recencyWeight(issue.lastUpdateAt, now);
      continue;
    }
    if (!shouldTreatAsActiveHazard(issue)) continue;
    const penalty =
      (HAZARD_PENALTY[issue.roadHazard ?? "other"] + SEVERITY_META[issue.severity].weight * 2) *
      weight;
    score -= penalty;
  }
  score += Math.min(12, repairBonus);
  return Math.max(8, Math.min(100, Math.round(score)));
}

export function pickRecommendedRoute(
  routes: ScoredRoute[],
  preference: "fastest" | "condition" | "balanced",
) {
  if (routes.length === 0) return undefined;
  if (preference === "fastest") {
    return [...routes].sort((a, b) => a.durationMin - b.durationMin)[0];
  }
  if (preference === "condition") {
    return [...routes].sort((a, b) => {
      const flood = Number(a.floodWarning) - Number(b.floodWarning);
      if (flood !== 0) return flood;
      return b.conditionScore - a.conditionScore || a.durationMin - b.durationMin;
    })[0];
  }
  return [...routes].sort((a, b) => {
    const aCost =
      a.durationMin + (100 - a.conditionScore) * 0.35 + (a.floodWarning ? 12 : 0);
    const bCost =
      b.durationMin + (100 - b.conditionScore) * 0.35 + (b.floodWarning ? 12 : 0);
    return aCost - bCost;
  })[0];
}

export function explainRecommendation(chosen: ScoredRoute, fastest: ScoredRoute) {
  if (chosen.id === fastest.id) {
    if (chosen.hazards.length === 0) {
      return "This is the fastest route and currently has no major reported road problems.";
    }
    return `This is the fastest route. It still has ${chosen.hazards.length} reported road problem${chosen.hazards.length === 1 ? "" : "s"}.`;
  }
  const extra = Math.round(chosen.durationMin - fastest.durationMin);
  const avoided = Math.max(0, fastest.hazards.length - chosen.hazards.length);
  if (avoided > 0) {
    return `This route is ${extra} minute${extra === 1 ? "" : "s"} longer but avoids ${avoided} recently reported road hazard${avoided === 1 ? "" : "s"}.`;
  }
  return `This route is ${extra} minute${extra === 1 ? "" : "s"} longer and currently has a better road-condition score (${chosen.conditionScore}/100 vs ${fastest.conditionScore}/100).`;
}
