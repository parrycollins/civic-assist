"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getAgency } from "@/data/agencies";
import { CivicStory, Journey } from "@/components/completed/Journey";
import { EvidenceGallery } from "@/components/issues/EvidenceGallery";
import { IssueTimeline } from "@/components/issues/IssueTimeline";
import { ErrorState } from "@/components/ui-kit/ErrorState";
import { CATEGORY_META } from "@/lib/constants";
import {
  completedAt,
  isCompletedWork,
  publicReporterLabel,
  resolutionLabel,
  verificationLabel,
  videosFor,
  workStartedAt,
} from "@/lib/completed";
import { formatDate, formatDateTime } from "@/lib/format";
import { useCivicStore } from "@/lib/store";

export function ProjectPage() {
  const params = useParams<{ id: string }>();
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const issue = issues.find((i) => i.id === params.id);

  if (!issue) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState title="Project not found" body="That completed-work record is not in this CivicGH archive." actionHref="/completed" actionLabel="Back to completed work" />
      </div>
    );
  }

  const agency = getAgency(issue.agencyId);
  const videos = videosFor(issue);
  const started = workStartedAt(issue);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">{issue.id}</p>
      <h1 className="font-heading text-3xl font-extrabold">
        {CATEGORY_META[issue.category].icon} {issue.title}
      </h1>
      <p className="text-sm text-muted-foreground">{issue.location.publicLabel}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Meta label="Location" value={issue.location.area} />
        <Meta label="Reported" value={formatDate(issue.reportedAt)} />
        <Meta label="Work started" value={started ? formatDate(started) : "Not recorded"} />
        <Meta label="Completed" value={formatDate(completedAt(issue))} />
        <Meta label="Reported by" value={publicReporterLabel(issue, user)} />
        <Meta label="Completed by" value={agency?.name ?? "Agency"} />
        <Meta label="Resolution time" value={resolutionLabel(issue)} />
        <Meta label="Citizen verification" value={verificationLabel(issue)} />
      </div>

      {!isCompletedWork(issue) && (
        <p className="rounded-2xl bg-secondary px-4 py-3 text-sm">
          This complaint is still {issue.status.replaceAll("_", " ")}. The archive page will fill in as work is completed.
        </p>
      )}

      <Journey issue={issue} />

      <section>
        <h2 className="mb-3 font-heading text-xl font-extrabold">Problem → Work → Result</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          The original citizen photo stays on the record. Agencies can only append evidence.
        </p>
        <EvidenceGallery evidence={issue.evidence.filter((e) => e.kind !== "video")} />
      </section>

      {videos.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-extrabold">Work videos</h2>
          {videos.map((video) => (
            <figure key={video.id} className="card-lift overflow-hidden rounded-[1.5rem] bg-card">
              <video
                controls
                preload="metadata"
                poster=""
                className="aspect-video w-full bg-black"
                src={video.videoDataUrl}
              />
              <figcaption className="space-y-1 p-4 text-sm">
                <p className="font-semibold">{video.description || "Completed work video"}</p>
                <p className="text-muted-foreground">
                  {formatDateTime(video.timestamp)} · {agency?.name} · {issue.id}
                </p>
                <p className="text-xs text-muted-foreground">
                  Uploaded by {video.uploadedBy} · {issue.location.area}
                </p>
              </figcaption>
            </figure>
          ))}
        </section>
      )}

      <CivicStory issue={issue} />

      <section>
        <h2 className="mb-3 font-heading text-xl font-extrabold">Project timeline</h2>
        <IssueTimeline events={issue.timeline} />
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href={`/issues/${issue.id}`} className="text-sm font-bold text-primary">
          Open complaint record
        </Link>
        <Link href="/completed" className="text-sm font-bold text-primary">
          All completed work
        </Link>
        <Link href={`/agencies/${issue.agencyId}`} className="text-sm font-bold text-primary">
          Agency portfolio
        </Link>
      </div>
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
