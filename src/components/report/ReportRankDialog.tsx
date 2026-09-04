"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { getAgency } from "@/data/agencies";
import { GatheringProgress } from "@/components/report/GatheringProgress";
import { rankHeadline } from "@/lib/dispatch";
import type { DispatchResult } from "@/lib/dispatch";

export function ReportRankDialog({
  result,
  onClose,
}: {
  result: DispatchResult;
  onClose: () => void;
}) {
  const agency = getAgency(result.issue.agencyId);
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-8">
      <div className="animate-civic-in w-full max-w-md text-center">
        <div className="civic-check mx-auto grid size-20 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-10" strokeWidth={3} />
        </div>
        <p className="mt-5 text-xs font-bold tracking-[0.16em] text-gold uppercase">CivicGH Cloud</p>
        <h2 className="mt-2 font-heading text-[1.7rem] leading-tight font-extrabold">
          {result.alreadyReported ? "You already reported this problem" : rankHeadline(result.rank)}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {result.alreadyReported
            ? "CivicGH counted your earlier report at this location. Duplicate filings from the same account do not move the total."
            : result.justForwarded
              ? `This location now has ${result.count} matching complaints. CivicGH has forwarded the case to ${agency?.name ?? "the responsible agency"}.`
              : result.joinedExisting
                ? "Your report was added to the existing problem at this location. It stays in CivicGH Cloud until five nearby complaints are reached."
                : "Your report is stored in CivicGH Cloud. The agency is not notified until five people report the same problem nearby."}
        </p>
        <div className="mt-5 text-left">
          <GatheringProgress issue={result.issue} />
        </div>
        <div className="mt-6 grid gap-2">
          <Link
            href={`/issues/${result.issue.id}`}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
          >
            View this case
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-secondary text-sm font-bold"
          >
            File another report
          </button>
        </div>
      </div>
    </div>
  );
}
