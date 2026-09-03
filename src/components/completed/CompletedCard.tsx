import Link from "next/link";
import { getAgency } from "@/data/agencies";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { CATEGORY_META } from "@/lib/constants";
import {
  completedAt,
  publicReporterLabel,
  resolutionLabel,
  verificationLabel,
} from "@/lib/completed";
import { formatDate } from "@/lib/format";
import type { Issue, User } from "@/lib/types";

export function CompletedCard({ issue, viewer }: { issue: Issue; viewer?: User | null }) {
  const agency = getAgency(issue.agencyId);
  const after = issue.evidence.find((e) => e.stage === "after") ?? issue.evidence[0];
  return (
    <article className="card-lift overflow-hidden rounded-[1.6rem] bg-card">
      <IssuePhoto
        photoKey={after?.photoKey ?? issue.photoKey}
        imageDataUrl={after?.imageDataUrl}
        stage={after?.stage ?? "after"}
        className="h-44 w-full"
        caption={CATEGORY_META[issue.category].label}
      />
      <div className="space-y-2 p-4">
        <p className="font-heading text-lg font-extrabold">
          {CATEGORY_META[issue.category].icon} {issue.title}
        </p>
        <p className="text-sm text-muted-foreground">📍 {issue.location.area}</p>
        <dl className="grid gap-1 text-sm">
          <Row label="Completed" value={formatDate(completedAt(issue))} />
          <Row label="Reported by" value={publicReporterLabel(issue, viewer)} />
          <Row label="Completed by" value={agency?.name ?? "Agency"} />
          <Row label="Time to resolution" value={resolutionLabel(issue)} />
          <Row label="Status" value={`✓ ${verificationLabel(issue)}`} />
        </dl>
        <Link
          href={`/completed/${issue.id}`}
          className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
        >
          View Work
        </Link>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
