"use client";

import Link from "next/link";
import { ROAD_SEGMENTS } from "@/data/roads";
import { useCivicStore } from "@/lib/store";
import { isOverdue, resolutionDays } from "@/lib/performance";
import { roadConditionScore } from "@/lib/scoring";
import { StatusPill } from "@/components/map/IssueSheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AgencyRoads() {
  const user = useCivicStore((s) => s.user);
  const issues = useCivicStore((s) => s.issues);
  const agencyId = user?.agencyId;
  const mine = issues.filter((i) => i.isRoadRelated && (!agencyId || i.agencyId === agencyId || ["dur", "gha"].includes(agencyId)));
  const overdue = mine.filter((issue) => isOverdue(issue));
  const high = mine.filter((i) => i.severity === "high" || i.severity === "critical");
  const days = mine.map(resolutionDays).filter((d): d is number => d !== null);
  const avg = days.length ? (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1) : "—";

  const hotspots = Object.entries(
    mine.reduce<Record<string, number>>((acc, i) => {
      acc[i.location.area] = (acc[i.location.area] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const frequent = Object.entries(
    mine.reduce<Record<string, number>>((acc, i) => {
      const key = i.roadSegmentId ?? i.location.street ?? i.location.area;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Road management</h1>
          <p className="text-sm text-muted-foreground">
            Road problems, active work, hotspots, and maintenance history for your jurisdiction.
          </p>
        </div>
        <Link href="/agency/map" className={cn(buttonVariants())}>
          Open agency map
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Road problems" value={mine.length} />
        <Stat label="Active work" value={mine.filter((i) => i.status === "in_progress").length} />
        <Stat label="Completed" value={mine.filter((i) => i.status === "resolved" || i.status === "verified").length} />
        <Stat label="Overdue" value={overdue.length} />
        <Stat label="High priority" value={high.length} />
        <Stat label="Avg repair time" value={`${avg} days`} />
      </div>

      <section>
        <h2 className="mb-2 font-heading font-semibold">Problem hotspots</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {hotspots.map(([area, n]) => (
            <li key={area} className="rounded-xl border p-3 text-sm">
              <span className="font-medium">{area}</span>
              <span className="ml-2 text-muted-foreground">{n} reports</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-heading font-semibold">Frequently reported roads</h2>
        <ul className="grid gap-2">
          {frequent.map(([id, n]) => {
            const seg = ROAD_SEGMENTS.find((r) => r.id === id);
            return (
              <li key={id} className="rounded-xl border p-3">
                <p className="font-medium">{seg?.name ?? id}</p>
                <p className="text-xs text-muted-foreground">{n} complaints on record</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-heading font-semibold">Road segments</h2>
        <div className="grid gap-3">
          {ROAD_SEGMENTS.map((seg) => {
            const related = issues.filter((i) => i.roadSegmentId === seg.id);
            const score = roadConditionScore(related);
            return (
              <article key={seg.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{seg.name}</h3>
                  <p className="text-sm">Road condition {score}/100</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {seg.area} · {related.length} linked complaints
                </p>
                <ol className="mt-2 space-y-1 text-sm">
                  {seg.history.map((h) => (
                    <li key={h.id}>
                      <span className="font-medium">{h.month}:</span> {h.label}
                    </li>
                  ))}
                </ol>
                <ul className="mt-3 grid gap-1">
                  {related.slice(0, 4).map((issue) => (
                    <li key={issue.id}>
                      <Link href={`/issues/${issue.id}`} className="flex items-center justify-between text-sm">
                        {issue.title}
                        <StatusPill status={issue.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-xl font-semibold">{value}</p>
    </div>
  );
}
