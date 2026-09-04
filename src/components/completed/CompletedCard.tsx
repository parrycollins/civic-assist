import Link from "next/link";
import { getAgency } from "@/data/agencies";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { VerificationBadge } from "@/components/completed/VerificationBadge";
import { CATEGORY_META } from "@/lib/constants";
import { completedAt, publicReporterLabel } from "@/lib/completed";
import { formatDate } from "@/lib/format";
import type { Issue, User } from "@/lib/types";

export function CompletedCard({ issue, viewer }: { issue: Issue; viewer?: User | null }) {
  const agency = getAgency(issue.agencyId);
  const after = issue.evidence.find((e) => e.stage === "after") ?? issue.evidence[0];
  return (
    <article className="card-lift pressable overflow-hidden rounded-[1.6rem] bg-card">
      <IssuePhoto
        photoKey={after?.photoKey ?? issue.photoKey}
        imageDataUrl={after?.imageDataUrl}
        stage={after?.stage ?? "after"}
        className="h-44 w-full"
        caption={CATEGORY_META[issue.category].label}
      />
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
          {CATEGORY_META[issue.category].label}
        </p>
        <p className="font-heading text-lg font-extrabold">{issue.title}</p>
        <p className="text-sm text-muted-foreground">📍 {issue.location.area}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">Completed by </span>
          <span className="font-semibold">{agency?.name ?? "Agency"}</span>
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Reported by </span>
          <span className="font-semibold">{publicReporterLabel(issue, viewer)}</span>
        </p>
        <p className="text-sm text-muted-foreground">{formatDate(completedAt(issue))}</p>
        <VerificationBadge issue={issue} />
        <Link
          href={`/completed/${issue.id}`}
          className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
        >
          View Details →
        </Link>
      </div>
    </article>
  );
}
