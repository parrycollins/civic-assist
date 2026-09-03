import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { formatDateTime } from "@/lib/format";
import type { Evidence, EvidenceStage } from "@/lib/types";

const LABELS: Record<EvidenceStage, string> = {
  before: "Before",
  during: "During",
  after: "After",
};

export function EvidenceGallery({ evidence }: { evidence: Evidence[] }) {
  const stages: EvidenceStage[] = ["before", "during", "after"];
  return (
    <div className="grid gap-4">
      {stages.map((stage) => {
        const items = evidence.filter((e) => e.stage === stage);
        if (items.length === 0) return null;
        return (
          <section key={stage}>
            <h3 className="mb-2 font-heading text-base font-semibold">{LABELS[stage]}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <figure key={item.id} className="overflow-hidden rounded-xl border">
                  <IssuePhoto
                    photoKey={item.photoKey}
                    imageDataUrl={item.imageDataUrl}
                    stage={item.stage}
                    className="h-44 w-full"
                    caption={LABELS[stage]}
                  />
                  <figcaption className="space-y-0.5 p-3 text-xs text-muted-foreground">
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
          </section>
        );
      })}
    </div>
  );
}
