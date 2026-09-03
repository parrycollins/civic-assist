"use client";

import { useMemo, useState } from "react";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { formatDateTime } from "@/lib/format";
import type { Evidence, EvidenceStage } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<EvidenceStage, string> = {
  before: "Before",
  during: "During",
  after: "After",
};

export function EvidenceGallery({ evidence }: { evidence: Evidence[] }) {
  const stages: EvidenceStage[] = ["before", "during", "after"];
  const available = stages.filter((stage) => evidence.some((e) => e.stage === stage));
  const [active, setActive] = useState<EvidenceStage>(available[0] ?? "before");
  const items = useMemo(() => evidence.filter((e) => e.stage === active), [evidence, active]);

  if (evidence.length === 0) {
    return (
      <div className="rounded-[1.6rem] bg-secondary/70 px-5 py-8 text-center">
        <p className="font-heading font-bold">No photos yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Agencies will add during and after evidence as work happens.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {available.map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => setActive(stage)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold",
              active === stage ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
            )}
          >
            {LABELS[stage]}
          </button>
        ))}
      </div>

      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
        {items.map((item) => (
          <figure
            key={item.id}
            className="min-w-[82%] snap-center overflow-hidden rounded-[1.5rem] bg-card card-lift sm:min-w-0"
          >
            <IssuePhoto
              photoKey={item.photoKey}
              imageDataUrl={item.imageDataUrl}
              stage={item.stage}
              className="h-52 w-full"
              caption={LABELS[item.stage]}
            />
            <figcaption className="space-y-0.5 p-4 text-xs text-muted-foreground">
              <p className="text-sm font-semibold text-foreground">{LABELS[item.stage]} evidence</p>
              <p>{formatDateTime(item.timestamp)}</p>
              <p>
                Uploaded by {item.uploadedBy}
                {item.agencyId ? ` (${item.agencyId.toUpperCase()})` : ""}
              </p>
              {item.description && <p className="text-foreground">{item.description}</p>}
            </figcaption>
          </figure>
        ))}
      </div>

      {available.includes("before") && available.includes("after") && (
        <p className="text-center text-xs font-medium text-muted-foreground">
          Swipe the photos to compare before and after work.
        </p>
      )}
    </div>
  );
}
