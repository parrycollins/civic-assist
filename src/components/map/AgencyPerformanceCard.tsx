"use client";

import { AGENCIES, getAgency } from "@/data/agencies";
import { agencyPerformance, performanceBand } from "@/lib/performance";
import type { Issue } from "@/lib/types";
import { ProgressRing } from "@/components/ui-kit/ProgressRing";

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
    <div className="rounded-[1.5rem] bg-card/95 p-4 text-sm shadow-[0_16px_40px_-22px_rgb(16_32_24/0.45)] backdrop-blur-xl">
      <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Agency Performance</p>
      <p className="mt-0.5 font-heading font-bold">{agency.name}</p>
      <div className="mt-2 flex items-center gap-3">
        <ProgressRing value={stats.resolutionRate} label={performanceBand(stats.resolutionRate)} size={96} />
        <dl className="grid flex-1 gap-1 text-xs">
          <div>
            Resolution rate <strong>{stats.resolutionRate.toFixed(1)}%</strong>
          </div>
          <div>
            Avg resolution <strong>{stats.averageResolutionDays} days</strong>
          </div>
          <div>
            Verified <strong>{stats.citizenVerified}</strong>
          </div>
          <div>
            Overdue <strong>{stats.overdue}</strong>
          </div>
        </dl>
      </div>
    </div>
  );
}
