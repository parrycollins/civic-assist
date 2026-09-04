"use client";

import Link from "next/link";
import { useCivicStore } from "@/lib/store";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { StatusPill } from "@/components/map/IssueSheet";
import { GatheringProgress } from "@/components/report/GatheringProgress";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { formatDate } from "@/lib/format";

export function MyReportsPage() {
  const user = useCivicStore((s) => s.user);
  const issues = useCivicStore((s) => s.issues);
  const myIssueIds = useCivicStore((s) => s.myIssueIds);
  const mine = issues.filter((i) => i.createdById === user?.id || myIssueIds.includes(i.id));
  const demoFollow = !user
    ? []
    : issues.filter((i) => ["CGH-2026-0001", "CGH-2026-0002", "CGH-2026-0003"].includes(i.id));
  const list = mine.length ? mine : demoFollow;

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <EmptyState
          title="Sign in to track reports"
          body="Your community is looking quiet until you follow the complaints you submitted."
          actionHref="/login"
          actionLabel="Sign in"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <h1 className="font-heading text-3xl font-extrabold">My reports</h1>
      {list.length === 0 ? (
        <EmptyState
          title="No reports yet"
          body="Your community is looking quiet. Start with a photo and an approximate location."
          actionHref="/report"
          actionLabel="Report an Issue"
        />
      ) : (
        <ul className="grid gap-3">
          {list.map((issue) => (
            <li key={issue.id}>
              <Link href={`/issues/${issue.id}`} className="card-lift flex gap-3 rounded-[1.5rem] bg-card p-2.5">
                <IssuePhoto photoKey={issue.photoKey} className="h-20 w-24 rounded-2xl" />
                <div className="min-w-0 py-1">
                  <p className="font-semibold">{issue.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {issue.id} · {formatDate(issue.reportedAt)}
                  </p>
                  <StatusPill status={issue.status} className="mt-2" />
                  <div className="mt-2">
                    <GatheringProgress issue={issue} compact />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
