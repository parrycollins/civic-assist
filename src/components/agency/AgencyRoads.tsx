"use client";

import Link from "next/link";
import { ROAD_SEGMENTS } from "@/data/roads";
import { useCivicStore } from "@/lib/store";
import { isForwardedToAgency } from "@/lib/dispatch";
import { isOverdue, resolutionDays } from "@/lib/performance";
import { roadConditionScore } from "@/lib/scoring";
import { StatusPill } from "@/components/map/IssueSheet";
import { StatCard } from "@/components/ui-kit/StatCard";

export function AgencyRoads() {
  const user = useCivicStore((s) => s.user);
  const issues = useCivicStore((s) => s.issues);
  const agencyId = user?.agencyId;
  const mine = issues.filter(
    (i) =>
      i.isRoadRelated &&
      isForwardedToAgency(i) &&
      (!agencyId || i.agencyId === agencyId || ["dur", "gha"].includes(agencyId)),
  );
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
          <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">Road Assist for agencies</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold">Road management</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Road problems, active work, hotspots, and maintenance history for your jurisdiction.
          </p>
        </div>
        <Link href="/agency/map" className="inline-flex h-11 items-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground">
          Open agency map
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Road problems" value={mine.length} />
        <StatCard label="Active work" value={mine.filter((i) => i.status === "in_progress").length} />
        <StatCard label="Completed" value={mine.filter((i) => i.status === "resolved" || i.status === "verified").length} tone="green" />
        <StatCard label="Overdue" value={overdue.length} tone={overdue.length ? "gold" : "default"} />
        <StatCard label="High priority" value={high.length} />
        <StatCard label="Avg repair time" value={`${avg} days`} />
      </div>

      <section>
        <h2 className="mb-3 font-heading text-xl font-bold">Problem hotspots</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {hotspots.map(([area, n]) => (
            <li key={area} className="card-lift rounded-[1.4rem] bg-card p-4 text-sm">
              <span className="font-heading font-bold">{area}</span>
              <span className="ml-2 text-muted-foreground">{n} reports</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl font-bold">Frequently reported roads</h2>
        <ul className="grid gap-2">
          {frequent.map(([id, n]) => {
            const seg = ROAD_SEGMENTS.find((r) => r.id === id);
            return (
              <li key={id} className="card-lift rounded-[1.4rem] bg-card p-4">
                <p className="font-heading font-bold">{seg?.name ?? id}</p>
                <p className="text-xs text-muted-foreground">{n} complaints on record</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl font-bold">Road segments</h2>
        <div className="grid gap-3">
          {ROAD_SEGMENTS.map((seg) => {
            const related = issues.filter((i) => i.roadSegmentId === seg.id);
            const score = roadConditionScore(related);
            return (
              <article key={seg.id} className="card-lift rounded-[1.6rem] bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-lg font-bold">{seg.name}</h3>
                  <p className="text-sm font-bold text-primary">Road condition {score}/100</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {seg.area} · {related.length} linked complaints
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                </div>
                <ol className="mt-3 space-y-1 text-sm">
                  {seg.history.map((h) => (
                    <li key={h.id}>
                      <span className="font-semibold">{h.month}:</span> {h.label}
                    </li>
                  ))}
                </ol>
                <ul className="mt-3 grid gap-2">
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
