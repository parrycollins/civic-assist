"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import { formatDate, fromNow } from "@/lib/format";
import { getAgency } from "@/data/agencies";
import { resolutionDays } from "@/lib/performance";
import type { Issue } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusPill({ status, className }: { status: Issue["status"]; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold",
        className,
      )}
      style={{ background: meta.fill, color: meta.color, borderColor: meta.color }}
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
  if (!issue) return null;
  const agency = getAgency(issue.agencyId);
  const resolved = issue.timeline.find((e) => e.status === "resolved");
  const days = resolutionDays(issue);
  const photo = issue.evidence.find((e) => e.stage === "before") ?? issue.evidence[0];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-lg">
        <DrawerHeader className="gap-0 text-left">
          <DrawerTitle className="pr-8 text-xl">{issue.title}</DrawerTitle>
          <p className="text-sm text-muted-foreground">{CATEGORY_META[issue.category].label}</p>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-6">
          <div className="overflow-hidden rounded-xl border">
            <IssuePhoto
              photoKey={photo?.photoKey ?? issue.photoKey}
              imageDataUrl={photo?.imageDataUrl}
              stage={photo?.stage}
              className="h-40 w-full"
              caption={`${CATEGORY_META[issue.category].label} · ${STATUS_META[issue.status].label}`}
            />
          </div>
          <p className="text-sm leading-6 text-foreground/90">{issue.description}</p>
          <div className="grid gap-2 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{issue.location.publicLabel}</span>
            </p>
            <p>Reported: {formatDate(issue.reportedAt)}</p>
            <p>Agency: {agency?.name ?? "Unassigned"}</p>
            <p className="flex flex-wrap items-center gap-2">
              Status: <StatusPill status={issue.status} />
            </p>
            {issue.reporterCount > 1 && (
              <p>
                {issue.reporterCount} reports · {issue.affectedCount ?? issue.reporterCount} people affected
              </p>
            )}
            <p className="text-muted-foreground">Last update {fromNow(issue.lastUpdateAt)}</p>
            {resolved && <p>Resolved: {formatDate(resolved.timestamp)}</p>}
          </div>
          {STATUS_META[issue.status].layer === "completed" && (
            <div className="rounded-xl border bg-emerald-50 p-3 text-sm dark:bg-emerald-950/40">
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">Community impact</p>
              <ul className="mt-1 space-y-0.5 text-emerald-950 dark:text-emerald-100">
                <li>Reported by: {issue.reporterCount} citizens</li>
                <li>Resolved by: {agency?.name}</li>
                {days !== null && <li>Resolution time: {days} day{days === 1 ? "" : "s"}</li>}
                <li>
                  Citizen verification: {issue.verificationCount}/{issue.reporterCount}
                </li>
                <li>Status: {issue.status === "verified" ? "✓ Verified" : STATUS_META[issue.status].label}</li>
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{issue.severity} severity</Badge>
            {issue.isRoadRelated && <Badge variant="outline">Road condition</Badge>}
            {issue.confidence >= 0.75 && <Badge variant="secondary">High confidence</Badge>}
          </div>
          <Link
            href={`/issues/${issue.id}`}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            View Details
          </Link>
          {agencyActions}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
