import { FORWARD_THRESHOLD, type DispatchResult } from "@/lib/dispatch";
import type { Category, RoadHazard } from "@/lib/types";

export interface CloudComplaint {
  id: string;
  issueId: string;
  category: Category;
  roadHazard?: RoadHazard;
  lat: number;
  lng: number;
  clusterKey: string;
  rank: number;
  count: number;
  forwarded: boolean;
  justForwarded: boolean;
  joinedExisting: boolean;
  createdAt: string;
}

type Ledger = {
  complaints: CloudComplaint[];
};

const globalForCloud = globalThis as typeof globalThis & { __civicghCloud?: Ledger };

function ledger(): Ledger {
  if (!globalForCloud.__civicghCloud) {
    globalForCloud.__civicghCloud = { complaints: [] };
  }
  return globalForCloud.__civicghCloud;
}

export function recordCloudComplaint(entry: CloudComplaint) {
  const store = ledger();
  store.complaints = [entry, ...store.complaints.filter((item) => item.id !== entry.id)].slice(0, 500);
  return entry;
}

export function listCloudComplaints() {
  return ledger().complaints;
}

export function cloudPayloadFromDispatch(result: DispatchResult, lat: number, lng: number): CloudComplaint {
  return {
    id: `${result.issue.id}-c${result.rank}`,
    issueId: result.issue.id,
    category: result.issue.category,
    roadHazard: result.issue.roadHazard,
    lat,
    lng,
    clusterKey: result.issue.clusterKey ?? result.issue.id,
    rank: result.rank,
    count: result.count,
    forwarded: result.forwarded,
    justForwarded: result.justForwarded,
    joinedExisting: result.joinedExisting,
    createdAt: new Date().toISOString(),
  };
}

export function cloudMeta() {
  return {
    threshold: FORWARD_THRESHOLD,
    stored: listCloudComplaints().length,
    forwarded: listCloudComplaints().filter((item) => item.forwarded).length,
  };
}
