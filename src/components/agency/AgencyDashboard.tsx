"use client";

import Link from "next/link";
import { useCivicStore } from "@/lib/store";
import { agencyPerformance, isOverdue, platformStats } from "@/lib/performance";
import { getAgency } from "@/data/agencies";
import { StatusPill } from "@/components/map/IssueSheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/constants";

export function AgencyDashboard() {
  const user = useCivicStore((s) => s.user);
  const issues = useCivicStore((s) => s.issues);
  const agencyId = user?.agencyId ?? "ama";
  const mine = issues.filter((i) => i.agencyId === agencyId);
  const stats = agencyPerformance(issues, agencyId);
  const agency = getAgency(agencyId);
  const overdue = mine.filter((issue) => isOverdue(issue));
  const platform = platformStats(mine);
  const road = mine.filter((i) => i.isRoadRelated);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Agency workbench</p>
        <h1 className="font-heading text-2xl font-semibold">{agency?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Complaints assigned to your agency, with the same map and evidence trail citizens see.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Received", stats.received],
          ["New", stats.newComplaints],
          ["Active work", stats.inProgress],
          ["Overdue", stats.overdue],
          ["Resolved", stats.resolved],
          ["Verified", stats.citizenVerified],
          ["Resolution rate", `${stats.resolutionRate.toFixed(1)}%`],
          ["Avg days", stats.averageResolutionDays],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-heading text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/agency/map" className={cn(buttonVariants())}>
          Agency map
        </Link>
        <Link href="/agency/roads" className={cn(buttonVariants({ variant: "outline" }))}>
          Road dashboard
        </Link>
      </div>

      <section>
        <h2 className="mb-2 font-heading font-semibold">Overdue</h2>
        {overdue.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overdue complaints right now.</p>
        ) : (
          <ul className="grid gap-2">
            {overdue.map((issue) => (
              <li key={issue.id}>
                <Link href={`/issues/${issue.id}`} className="flex items-center justify-between rounded-xl border p-3">
                  <span>
                    <span className="font-medium">{issue.title}</span>
                    <span className="block text-xs text-muted-foreground">{issue.location.publicLabel}</span>
                  </span>
                  <StatusPill status={issue.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-heading font-semibold">Assigned queue</h2>
        <ul className="grid gap-2">
          {mine.slice(0, 12).map((issue) => (
            <li key={issue.id}>
              <Link href={`/issues/${issue.id}`} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{issue.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {issue.id} · {STATUS_META[issue.status].label}
                    {issue.isRoadRelated ? " · road" : ""}
                  </span>
                </span>
                <StatusPill status={issue.status} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="font-heading font-semibold">Agency work summary</h2>
        <p className="mt-2 text-sm">
          {platform.completed} completed jobs on record, {platform.verified} citizen-verified, {road.length} road-related
          reports in jurisdiction.
        </p>
      </section>
    </div>
  );
}
