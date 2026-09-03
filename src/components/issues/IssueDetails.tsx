"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getAgency } from "@/data/agencies";
import { getRoadSegment } from "@/data/roads";
import { EvidenceGallery } from "@/components/issues/EvidenceGallery";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { IssueTimeline } from "@/components/issues/IssueTimeline";
import { StatusPill } from "@/components/map/IssueSheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { isOverdue, resolutionDays } from "@/lib/performance";
import { useCivicStore } from "@/lib/store";
import type { EvidenceStage, IssueStatus } from "@/lib/types";

export function IssueDetails() {
  const params = useParams<{ id: string }>();
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const verifyIssue = useCivicStore((s) => s.verifyIssue);
  const disputeIssue = useCivicStore((s) => s.disputeIssue);
  const confirmIssue = useCivicStore((s) => s.confirmIssue);
  const updateIssueStatus = useCivicStore((s) => s.updateIssueStatus);
  const addEvidence = useCivicStore((s) => s.addEvidence);
  const issue = issues.find((i) => i.id === params.id);
  const [note, setNote] = useState("");
  const [stage, setStage] = useState<EvidenceStage>("during");

  const nextStatuses = useMemo(() => {
    if (!issue) return [];
    const map: Partial<Record<IssueStatus, IssueStatus[]>> = {
      reported: ["under_review", "assigned"],
      under_review: ["assigned", "disputed"],
      assigned: ["in_progress"],
      in_progress: ["resolved"],
      resolved: ["verified", "disputed"],
      verified: ["disputed"],
      disputed: ["under_review", "in_progress"],
    };
    return map[issue.status] ?? [];
  }, [issue]);

  if (!issue) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="font-heading text-lg font-semibold">Complaint not found</p>
        <Link href="/map" className="mt-2 inline-block text-sm text-primary">
          Back to map
        </Link>
      </div>
    );
  }

  const agency = getAgency(issue.agencyId);
  const road = issue.roadSegmentId ? getRoadSegment(issue.roadSegmentId) : undefined;
  const days = resolutionDays(issue);
  const canAgency = user?.role === "agency" && user.agencyId === issue.agencyId;
  const completed = STATUS_META[issue.status].layer === "completed";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{issue.id}</p>
        <h1 className="font-heading text-2xl font-semibold">
          {issue.title} — {issue.location.area}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusPill status={issue.status} />
          <span className="text-sm text-muted-foreground">{CATEGORY_META[issue.category].label}</span>
        </div>
      </div>

      <IssuePhoto
        photoKey={issue.photoKey}
        imageDataUrl={issue.evidence[0]?.imageDataUrl}
        className="h-52 w-full rounded-2xl border"
      />

      <p className="leading-7">{issue.description}</p>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Location</dt>
          <dd>{issue.location.publicLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Reported</dt>
          <dd>{formatDate(issue.reportedAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Responsible agency</dt>
          <dd>{agency?.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Reports / people affected</dt>
          <dd>
            {issue.reporterCount} / {issue.affectedCount ?? issue.reporterCount}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Confidence</dt>
          <dd>{Math.round(issue.confidence * 100)}% · {issue.supportingReports} supporting · {issue.denials} say it is gone</dd>
        </div>
        {isOverdue(issue) && <div className="text-destructive">Overdue against the agency due date</div>}
      </dl>

      {completed && (
        <section className="rounded-2xl border bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <h2 className="font-heading font-semibold">Community impact</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Reported by: {issue.reporterCount} citizens</li>
            <li>Resolved by: {agency?.name}</li>
            {days !== null && <li>Resolution time: {days} days</li>}
            <li>
              Citizen verification: {issue.verificationCount}/{issue.reporterCount}
            </li>
            <li>Status: {issue.status === "verified" ? "✓ Verified" : STATUS_META[issue.status].label}</li>
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">History</h2>
        <IssueTimeline events={issue.timeline} />
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Before &amp; after evidence</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Agencies can add photos when they update a complaint. Original evidence is kept — new uploads are appended,
          never replaced.
        </p>
        <EvidenceGallery evidence={issue.evidence} />
      </section>

      {road && (
        <section>
          <h2 className="mb-2 font-heading text-lg font-semibold">Road history · {road.name}</h2>
          <ol className="space-y-2 text-sm">
            {road.history.map((h) => (
              <li key={h.id} className="rounded-lg border p-3">
                <p className="font-medium">
                  {h.month}: {h.label}
                </p>
                <p className="text-muted-foreground">{h.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="grid gap-2 rounded-2xl border p-4">
        <h2 className="font-heading font-semibold">Community confirmation</h2>
        <p className="text-sm text-muted-foreground">
          One report is not treated as confirmed. Confirming or saying the problem is gone changes confidence used by
          Road Assist.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              confirmIssue(issue.id, true);
              toast.success("Thanks — this report is more confident.");
            }}
          >
            Still there
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              confirmIssue(issue.id, false);
              toast.success("Noted — confidence reduced.");
            }}
          >
            No longer there
          </Button>
          {completed && user?.role === "citizen" && (
            <Button
              onClick={() => {
                verifyIssue(issue.id);
                toast.success("Your verification was recorded.");
              }}
            >
              Verify completed work
            </Button>
          )}
          {user?.role === "citizen" && completed && (
            <Button
              variant="destructive"
              onClick={() => {
                disputeIssue(issue.id, "Citizen says the problem has returned.");
                toast.message("Issue reopened as disputed.");
              }}
            >
              Dispute / reopen
            </Button>
          )}
        </div>
      </section>

      {canAgency && (
        <section className="grid gap-3 rounded-2xl border p-4">
          <h2 className="font-heading font-semibold">Agency update</h2>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <Button
                key={status}
                variant="secondary"
                onClick={() => {
                  updateIssueStatus(issue.id, status, note || undefined);
                  toast.success(`Status set to ${STATUS_META[status].label}. The public map updates immediately.`);
                }}
              >
                Mark {STATUS_META[status].label}
              </Button>
            ))}
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional public note (no personal data)"
          />
          <div className="grid gap-2">
            <p className="text-sm font-medium">Upload evidence (kept in audit history)</p>
            <select
              className="h-9 rounded-lg border px-2 text-sm"
              value={stage}
              onChange={(e) => setStage(e.target.value as EvidenceStage)}
            >
              <option value="before">Before</option>
              <option value="during">During</option>
              <option value="after">After</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  addEvidence(issue.id, stage, { imageDataUrl: String(reader.result) }, note);
                  toast.success("Evidence added. Previous photos remain in the history.");
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        Public pages do not show citizen phone numbers, emails, or exact residential locations.
      </p>
      <Link href="/map" className="text-sm font-medium text-primary">
        Back to map
      </Link>
    </div>
  );
}
