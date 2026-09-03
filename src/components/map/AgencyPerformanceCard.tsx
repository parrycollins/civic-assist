"use client";

import { AGENCIES, getAgency } from "@/data/agencies";
import { agencyPerformance } from "@/lib/performance";
import type { Issue } from "@/lib/types";

export function AgencyPerformanceCard({
  agencyId,
  issues,
}: {
  agencyId: string;
  issues: Issue[];
}) {
  const agency = getAgency(agencyId) ?? AGENCIES[0];
  const stats = agencyPerformance(issues, agency.id);
  return (
    <div className="rounded-2xl border bg-background/95 p-3 text-sm shadow-lg backdrop-blur">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Agency Performance
      </p>
      <p className="mt-0.5 font-semibold">{agency.name}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div>
          Complaints received: <strong>{stats.received.toLocaleString()}</strong>
        </div>
        <div>
          Resolved: <strong>{stats.resolved.toLocaleString()}</strong>
        </div>
        <div>
          Resolution rate: <strong>{stats.resolutionRate.toFixed(1)}%</strong>
        </div>
        <div>
          Average resolution time: <strong>{stats.averageResolutionDays} days</strong>
        </div>
        <div>
          Citizen verified: <strong>{stats.citizenVerified.toLocaleString()}</strong>
        </div>
        <div>
          Overdue: <strong>{stats.overdue}</strong>
        </div>
      </dl>
    </div>
  );
}
