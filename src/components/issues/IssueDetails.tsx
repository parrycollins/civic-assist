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
import { StatusTrack } from "@/components/issues/StatusTrack";
import { Journey } from "@/components/completed/Journey";
import { StatusPill } from "@/components/map/IssueSheet";
import { publicReporterLabel, verificationLabel } from "@/lib/completed";
import { ErrorState } from "@/components/ui-kit/ErrorState";
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
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState
          title="Complaint not found"
          body="That report may have been reset or the link is no longer valid."
          actionHref="/map"
          actionLabel="Back to map"
        />
      </div>
    );
  }

  const agency = getAgency(issue.agencyId);
  const road = issue.roadSegmentId ? getRoadSegment(issue.roadSegmentId) : undefined;
  const days = resolutionDays(issue);
  const canAgency = user?.role === "agency" && user.agencyId === issue.agencyId;
  const completed = STATUS_META[issue.status].layer === "completed";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="animate-civic-in">
        <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">{issue.id}</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold leading-tight">
          {CATEGORY_META[issue.category].icon} {issue.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {issue.location.area} · {issue.location.publicLabel}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill status={issue.status} />
          <span className="text-sm font-medium text-muted-foreground">{CATEGORY_META[issue.category].label}</span>
        </div>
      </div>

      <IssuePhoto
        photoKey={issue.photoKey}
        imageDataUrl={issue.evidence[0]?.imageDataUrl}
        className="h-56 w-full rounded-[1.8rem] card-lift"
      />

      <p className="text-base leading-7">{issue.description}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Meta label="Location" value={issue.location.publicLabel} />
        <Meta label="Reported" value={formatDate(issue.reportedAt)} />
        <Meta label="Responsible agency" value={agency?.name ?? "Unassigned"} />
        <Meta label="Reported by" value={publicReporterLabel(issue, user)} />
        {completed && <Meta label="Verification" value={verificationLabel(issue)} />}
        <Meta label="Reports / people affected" value={`${issue.reporterCount} / ${issue.affectedCount ?? issue.reporterCount}`} />
        <Meta
          label="Confidence"
          value={`${Math.round(issue.confidence * 100)}% · ${issue.supportingReports} supporting · ${issue.denials} say it is gone`}
        />
        {isOverdue(issue) && <Meta label="Due date" value="Overdue against the agency due date" />}
      </div>

      {issue.status === "resolved" && (
        <p className="rounded-[1.3rem] bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
          Awaiting citizen verification. Agency completion is not the same as a citizen-verified result.
        </p>
      )}

      {completed && <Journey issue={issue} />}

      {completed && (
        <Link href={`/completed/${issue.id}`} className="inline-flex h-11 items-center rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground">
          Open completed-work record
        </Link>
      )}

      {completed && (
        <section className="rounded-[1.6rem] bg-emerald-50 p-5 dark:bg-emerald-950/30">
          <h2 className="font-heading text-lg font-bold">Community impact</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            <li>Reported by {issue.reporterCount} citizens</li>
            <li>Resolved by {agency?.name}</li>
            {days !== null && <li>Resolution time: {days} days</li>}
            <li>
              Citizen verification: {issue.verificationCount}/{issue.reporterCount}
            </li>
            <li>Status: {issue.status === "verified" ? "✓ Verified" : STATUS_META[issue.status].label}</li>
          </ul>
        </section>
      )}

      <section className="card-lift rounded-[1.7rem] bg-card p-5">
        <h2 className="mb-4 font-heading text-lg font-bold">Progress</h2>
        <StatusTrack status={issue.status} events={issue.timeline} />
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold">History</h2>
        <IssueTimeline events={issue.timeline} />
      </section>

      <section>
        <h2 className="mb-2 font-heading text-lg font-bold">Before / during / after</h2>
        <p className="mb-4 text-sm leading-6 text-muted-foreground">
          Agencies can add photos when they update a complaint. Original evidence is kept — new uploads are appended,
          never replaced.
        </p>
        <EvidenceGallery evidence={issue.evidence} />
      </section>

      {road && (
        <section className="card-lift rounded-[1.6rem] bg-card p-5">
          <h2 className="mb-3 font-heading text-lg font-bold">Road history · {road.name}</h2>
          <ol className="space-y-2 text-sm">
            {road.history.map((h) => (
              <li key={h.id} className="rounded-2xl bg-secondary/70 p-3">
                <p className="font-semibold">
                  {h.month}: {h.label}
                </p>
                <p className="text-muted-foreground">{h.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="card-lift grid gap-3 rounded-[1.6rem] bg-card p-5">
        <h2 className="font-heading text-lg font-bold">Community confirmation</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          One report is not treated as confirmed. Confirming or saying the problem is gone changes confidence used by
          Road Assist.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="h-11 rounded-2xl bg-secondary px-4 text-sm font-bold"
            onClick={() => {
              confirmIssue(issue.id, true);
              toast.success("Thanks — this report is more confident.");
            }}
          >
            Still there
          </button>
          <button
            type="button"
            className="h-11 rounded-2xl bg-secondary px-4 text-sm font-bold"
            onClick={() => {
              confirmIssue(issue.id, false);
              toast.success("Noted — confidence reduced.");
            }}
          >
            No longer there
          </button>
          {completed && user?.role === "citizen" && (
            <button
              type="button"
              className="h-11 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground"
              onClick={() => {
                verifyIssue(issue.id);
                toast.success("Your verification was recorded.");
              }}
            >
              Verify completed work
            </button>
          )}
          {user?.role === "citizen" && completed && (
            <button
              type="button"
              className="h-11 rounded-2xl bg-destructive/10 px-4 text-sm font-bold text-destructive"
              onClick={() => {
                disputeIssue(issue.id, "Citizen says the problem has returned.");
                toast.message("Issue reopened as disputed.");
              }}
            >
              Dispute / reopen
            </button>
          )}
        </div>
      </section>

      {canAgency && (
        <section className="card-lift grid gap-3 rounded-[1.6rem] bg-card p-5">
          <h2 className="font-heading text-lg font-bold">Agency update</h2>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                type="button"
                className="h-11 rounded-2xl bg-secondary px-4 text-sm font-bold"
                onClick={() => {
                  updateIssueStatus(issue.id, status, note || undefined);
                  toast.success(`Status set to ${STATUS_META[status].label}. The public map updates immediately.`);
                }}
              >
                Mark {STATUS_META[status].label}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional public note (no personal data)"
            className="min-h-24 rounded-2xl bg-secondary px-4 py-3 text-sm outline-none"
          />
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Upload evidence (kept in audit history)</p>
            <select
              className="h-11 rounded-2xl bg-secondary px-3 text-sm"
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
                  addEvidence(issue.id, stage, { imageDataUrl: String(reader.result), fileType: file.type }, note);
                  toast.success("Photo added. The original citizen evidence stays on the record.");
                };
                reader.readAsDataURL(file);
              }}
            />
            <p className="text-sm font-semibold">Upload a short completion video</p>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 6_000_000) {
                  toast.error("Keep videos under 6 MB for this browser archive.");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  addEvidence(
                    issue.id,
                    stage,
                    { videoDataUrl: String(reader.result), fileType: file.type, photoKey: `${stage}-video` },
                    note || "Agency completion video",
                  );
                  toast.success("Video appended. Earlier photos and videos were not replaced.");
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>
        </section>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        Public pages do not show citizen phone numbers, emails, or exact residential locations.
      </p>
      <Link href="/map" className="inline-flex text-sm font-bold text-primary">
        Back to map
      </Link>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] bg-card px-4 py-3 card-lift">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
