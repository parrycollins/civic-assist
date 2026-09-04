import { STATUS_META } from "@/lib/constants";
import { approximateLocation, haversineKm } from "@/lib/geo";
import type { Category, GeoPoint, Issue, RoadHazard } from "@/lib/types";

/** Nearby reports of the same problem type share one civic case. */
export const CLUSTER_RADIUS_KM = 0.3;

/** A case stays in CivicGH Cloud until this many location-matched complaints exist. */
export const FORWARD_THRESHOLD = 5;

export interface DispatchResult {
  issue: Issue;
  rank: number;
  count: number;
  threshold: number;
  forwarded: boolean;
  justForwarded: boolean;
  joinedExisting: boolean;
  alreadyReported: boolean;
}

export function locationClusterKey(
  category: Category,
  point: GeoPoint,
  hazard?: RoadHazard,
) {
  const approx = approximateLocation(point);
  return `${category}:${hazard ?? "any"}:${approx.lat.toFixed(4)},${approx.lng.toFixed(4)}`;
}

export function complaintCount(issue: Issue) {
  return issue.complaintCount ?? issue.reporterCount ?? 1;
}

export function isForwardedToAgency(issue: Issue) {
  if (typeof issue.forwardedToAgency === "boolean") return issue.forwardedToAgency;
  if (STATUS_META[issue.status].layer === "completed") return true;
  return complaintCount(issue) >= FORWARD_THRESHOLD;
}

export function remainingReports(issue: Issue) {
  return Math.max(0, FORWARD_THRESHOLD - complaintCount(issue));
}

export function agencyQueue(issues: Issue[], agencyId?: string) {
  return issues.filter((issue) => {
    if (!isForwardedToAgency(issue)) return false;
    if (agencyId && issue.agencyId !== agencyId) return false;
    return true;
  });
}

export function findLocationCluster(
  issues: Issue[],
  input: { category: Category; lat: number; lng: number; roadHazard?: RoadHazard },
) {
  const approx = approximateLocation({ lat: input.lat, lng: input.lng });
  const key = locationClusterKey(input.category, approx, input.roadHazard);
  const open = issues.filter(
    (issue) =>
      issue.category === input.category &&
      STATUS_META[issue.status].layer !== "completed" &&
      issue.status !== "disputed",
  );
  return open.find((issue) => {
    if ((issue.clusterKey ?? locationClusterKey(issue.category, issue.location, issue.roadHazard)) === key) {
      return true;
    }
    if (input.roadHazard && issue.roadHazard && issue.roadHazard !== input.roadHazard) return false;
    return haversineKm(issue.location, approx) <= CLUSTER_RADIUS_KM;
  });
}

export function ordinal(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function hydrateDispatch(issue: Issue): Issue {
  const count = complaintCount(issue);
  const completed = STATUS_META[issue.status].layer === "completed";
  const forwarded = completed || count >= FORWARD_THRESHOLD;
  const status = !forwarded && !completed ? "reported" : issue.status;
  const timeline =
    !forwarded && status === "reported"
      ? issue.timeline.filter((event) => event.status === "reported" || event.actorRole === "citizen")
      : issue.timeline;
  return {
    ...issue,
    status,
    reporterCount: count,
    complaintCount: count,
    supportingReports: Math.max(issue.supportingReports, count),
    forwardedToAgency: forwarded,
    forwardedAt:
      issue.forwardedAt ??
      (forwarded
        ? issue.timeline.find((event) => event.status === "under_review" || event.status === "assigned")?.timestamp
        : undefined),
    clusterKey: issue.clusterKey ?? locationClusterKey(issue.category, issue.location, issue.roadHazard),
    contributorIds: issue.contributorIds ?? [],
    timeline: timeline.length ? timeline : issue.timeline,
  };
}

export function rankHeadline(rank: number) {
  if (rank === 1) return "You are the first to report this problem";
  return `You are the ${ordinal(rank)} to report this problem`;
}
