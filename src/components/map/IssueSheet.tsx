"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import { fromNow } from "@/lib/format";
import { getAgency } from "@/data/agencies";
import { resolutionDays } from "@/lib/performance";
import type { Issue } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusPill({ status, className }: { status: Issue["status"]; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", className)}
      style={{ background: meta.fill, color: meta.color }}
    >
      <span aria-hidden>{meta.glyph}</span>
      {meta.label}
    </span>
  );
}

export function IssueSheet({
  issue,
  open,
  onOpenChange,
  agencyActions,
}: {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agencyActions?: React.ReactNode;
}) {
  if (!open || !issue) return null;
  const agency = getAgency(issue.agencyId);
  const days = resolutionDays(issue);
  const photo = issue.evidence.find((e) => e.stage === "before") ?? issue.evidence[0];

  return (
    <div className="pointer-events-none absolute inset-0 z-[2000]">
      <button
        type="button"
        aria-label="Close issue card"
        className="pointer-events-auto absolute inset-0 bg-black/25"
        onClick={() => onOpenChange(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-card-title"
        className="animate-civic-in pointer-events-auto absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg overflow-hidden rounded-t-[1.8rem] bg-card pb-[calc(5.25rem+env(safe-area-inset-bottom))] shadow-[0_-20px_50px_-24px_rgb(16_32_24/0.45)] md:bottom-6 md:rounded-[1.8rem] md:pb-0"
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-border md:hidden" />
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div className="min-w-0">
            <h2 id="issue-card-title" className="font-heading text-2xl font-extrabold">
              {CATEGORY_META[issue.category].icon} {issue.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {issue.location.area} · {issue.location.publicLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="grid size-9 place-items-center rounded-full bg-secondary"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <IssuePhoto
            photoKey={photo?.photoKey ?? issue.photoKey}
            imageDataUrl={photo?.imageDataUrl}
            stage={photo?.stage}
            className="h-36 w-full rounded-2xl"
          />
          <p className="text-sm leading-6">{issue.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusPill status={issue.status} />
            <span className="text-muted-foreground">{fromNow(issue.reportedAt)}</span>
          </div>
          <p className="text-sm font-semibold">{agency?.name}</p>
          {STATUS_META[issue.status].layer === "completed" && days !== null && (
            <p className="rounded-2xl bg-secondary px-3 py-2 text-sm">Resolved in {days} days · {issue.verificationCount}/{issue.reporterCount} verified</p>
          )}
          <Link
            href={`/issues/${issue.id}`}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
          >
            View Details
          </Link>
          {agencyActions}
        </div>
      </aside>
    </div>
  );
}
