"use client";

import Link from "next/link";
import { useCivicStore } from "@/lib/store";
import { agencyQueue } from "@/lib/dispatch";
import { agencyPerformance, categoryBreakdown, isOverdue, monthlyTrend, performanceBand } from "@/lib/performance";
import { getAgency } from "@/data/agencies";
import { StatusPill } from "@/components/map/IssueSheet";
import { ProgressRing } from "@/components/ui-kit/ProgressRing";
import { StatCard } from "@/components/ui-kit/StatCard";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";

export function AgencyDashboard() {
  const user = useCivicStore((s) => s.user);
  const issues = useCivicStore((s) => s.issues);
  const agencyId = user?.agencyId ?? "ama";
  const mine = agencyQueue(issues, agencyId);
  const stats = agencyPerformance(issues, agencyId);
  const agency = getAgency(agencyId);
  const overdue = mine.filter((issue) => isOverdue(issue));
  const road = mine.filter((i) => i.isRoadRelated);
  const months = monthlyTrend(mine);
  const cats = categoryBreakdown(mine);
  const maxMonth = Math.max(1, ...months.map((m) => Math.max(m.received, m.resolved)));
  const nowLabel = new Date("2026-09-03").toLocaleString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">Agency workbench</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold">{agency?.name}</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Complaints forwarded to your agency after five location-matched citizen reports in CivicGH Cloud.
        </p>
      </div>

      <section className="card-lift grid gap-5 rounded-[1.8rem] bg-card p-5 md:grid-cols-[auto_1fr]">
        <ProgressRing value={stats.resolutionRate} label={performanceBand(stats.resolutionRate)} />
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Agency Performance</p>
          <p className="mt-1 font-heading text-4xl font-extrabold">{Math.round(stats.resolutionRate)}</p>
          <p className="text-sm font-semibold text-gold">{performanceBand(stats.resolutionRate)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Mini label="Resolution rate" value={`${stats.resolutionRate.toFixed(0)}%`} />
            <Mini label="Average response" value={`${stats.averageResolutionDays} days`} />
            <Mini label="Average resolution" value={`${stats.averageResolutionDays} days`} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Received" value={stats.received} />
        <StatCard label="New" value={stats.newComplaints} />
        <StatCard label="Active work" value={stats.inProgress} />
        <StatCard label="Overdue" value={stats.overdue} tone={stats.overdue ? "gold" : "default"} />
        <StatCard label="Resolved" value={stats.resolved} tone="green" />
        <StatCard label="Verified" value={stats.citizenVerified} />
        <StatCard label="Road reports" value={road.length} />
        <StatCard label="Avg days" value={stats.averageResolutionDays} />
      </div>

      <section className="card-lift rounded-[1.7rem] bg-card p-5">
        <h2 className="font-heading text-lg font-bold">Monthly performance</h2>
        <div className="mt-4 grid grid-cols-6 items-end gap-2">
          {months.map((m) => (
            <div key={m.key} className="grid gap-1">
              <div className="flex h-28 items-end gap-1">
                <div
                  className="flex-1 rounded-t-lg bg-primary/80"
                  style={{ height: `${(m.received / maxMonth) * 100}%` }}
                  title={`${m.received} received`}
                />
                <div
                  className="flex-1 rounded-t-lg bg-gold"
                  style={{ height: `${(m.resolved / maxMonth) * 100}%` }}
                  title={`${m.resolved} resolved`}
                />
              </div>
              <p className="text-center text-[10px] font-bold text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Green = received · Gold = resolved</p>
      </section>

      <section className="card-lift rounded-[1.7rem] bg-primary p-5 text-primary-foreground">
        <p className="text-xs font-bold tracking-[0.14em] text-primary-foreground/70 uppercase">{nowLabel}</p>
        <h2 className="mt-1 font-heading text-2xl font-extrabold">Work summary</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <HeroStat value={stats.received} label="Complaints received" />
          <HeroStat value={stats.resolved} label="Resolved" />
          <HeroStat value={`${stats.resolutionRate.toFixed(1)}%`} label="Resolution rate" />
        </div>
        <div className="mt-5">
          <p className="text-sm font-bold">Work completed</p>
          <ul className="mt-2 space-y-2 text-sm">
            {cats.map((c) => {
              const meta = CATEGORY_META[c.id as keyof typeof CATEGORY_META];
              return (
                <li key={c.id} className="flex justify-between rounded-2xl bg-white/8 px-3 py-2">
                  <span>
                    {meta?.icon} {meta?.label ?? c.id}
                  </span>
                  <span className="font-bold">{c.count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/agency/map" className="inline-flex h-11 items-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground">
          Agency map
        </Link>
        <Link href="/agency/roads" className="inline-flex h-11 items-center rounded-2xl bg-card px-5 text-sm font-bold card-lift">
          Road dashboard
        </Link>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-xl font-bold">Overdue</h2>
        {overdue.length === 0 ? (
          <EmptyState title="Nothing overdue" body="Your agency is current against the due dates on assigned complaints." />
        ) : (
          <ul className="grid gap-2">
            {overdue.map((issue) => (
              <li key={issue.id}>
                <Link href={`/issues/${issue.id}`} className="card-lift flex items-center justify-between rounded-[1.4rem] bg-card p-4">
                  <span>
                    <span className="font-semibold">{issue.title}</span>
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
        <h2 className="mb-3 font-heading text-xl font-bold">Forwarded queue</h2>
        {mine.length === 0 ? (
          <EmptyState
            title="No forwarded cases yet"
            body="CivicGH Cloud holds citizen reports until five people flag the same problem nearby. Those cases then appear here."
          />
        ) : (
        <ul className="grid gap-2">
          {mine.slice(0, 12).map((issue) => (
            <li key={issue.id}>
              <Link href={`/issues/${issue.id}`} className="card-lift flex items-center justify-between gap-3 rounded-[1.4rem] bg-card p-4">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{issue.title}</span>
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
        )}
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/70 px-3 py-3">
      <p className="font-heading text-xl font-extrabold">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function HeroStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <p className="font-heading text-3xl font-extrabold">{value}</p>
      <p className="text-xs text-primary-foreground/70">{label}</p>
    </div>
  );
}
