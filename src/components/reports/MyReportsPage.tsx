"use client";

import Link from "next/link";
import { useCivicStore } from "@/lib/store";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { StatusPill } from "@/components/map/IssueSheet";
import { formatDate } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <h1 className="font-heading text-xl font-semibold">My reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to track the complaints you submitted.</p>
        <Link href="/login" className={cn(buttonVariants(), "mt-4")}>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <h1 className="font-heading text-2xl font-semibold">My reports</h1>
      {list.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center">
          <p className="font-medium">You have not submitted a report yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start with a photo and an approximate location. Your identity stays off the public map.
          </p>
          <Link href="/report" className={cn(buttonVariants(), "mt-4")}>
            Report a problem
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {list.map((issue) => (
            <li key={issue.id}>
              <Link href={`/issues/${issue.id}`} className="flex gap-3 rounded-2xl border p-2">
                <IssuePhoto photoKey={issue.photoKey} className="h-20 w-24 rounded-xl" />
                <div className="min-w-0">
                  <p className="font-medium">{issue.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {issue.id} · {formatDate(issue.reportedAt)}
                  </p>
                  <StatusPill status={issue.status} className="mt-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
