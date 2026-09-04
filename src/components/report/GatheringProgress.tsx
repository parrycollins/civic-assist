import { FORWARD_THRESHOLD, complaintCount, isForwardedToAgency, remainingReports } from "@/lib/dispatch";
import { getAgency } from "@/data/agencies";
import type { Issue } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GatheringProgress({
  issue,
  compact = false,
  className,
}: {
  issue: Issue;
  compact?: boolean;
  className?: string;
}) {
  const count = complaintCount(issue);
  const remaining = remainingReports(issue);
  const forwarded = isForwardedToAgency(issue);
  const agency = getAgency(issue.agencyId);
  const pct = Math.min(100, Math.round((count / FORWARD_THRESHOLD) * 100));

  if (forwarded) {
    return (
      <div className={cn("rounded-[1.3rem] bg-primary/8 px-4 py-3", className)}>
        <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Forwarded to agency</p>
        <p className={cn("mt-1 font-semibold", compact ? "text-sm" : "text-sm leading-6")}>
          {count} nearby complaints reached CivicGH Cloud. This case was sent to {agency?.name ?? "the responsible agency"}.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[1.3rem] bg-secondary/80 px-4 py-3", className)}>
      <p className="text-xs font-bold tracking-[0.14em] text-gold uppercase">Stored in CivicGH Cloud</p>
      <p className="mt-1 font-heading text-lg font-extrabold">
        {count} of {FORWARD_THRESHOLD} reports
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-card">
        <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      {!compact ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {remaining === 1
            ? "One more nearby report and this will be forwarded to the agency."
            : `${remaining} more nearby reports are needed before CivicGH forwards this to ${agency?.shortName ?? "the agency"}.`}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">{remaining} more to forward</p>
      )}
    </div>
  );
}
