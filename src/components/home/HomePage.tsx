"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Map, Navigation, Plus, ShieldCheck } from "lucide-react";
import { useCivicStore } from "@/lib/store";
import { categoryBreakdown, monthlyTrend, platformStats } from "@/lib/performance";
import { CATEGORY_META, STATUS_META } from "@/lib/constants";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { StatusPill } from "@/components/map/IssueSheet";
import { getAgency } from "@/data/agencies";
import { greeting } from "@/theme/tokens";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { StatCard } from "@/components/ui-kit/StatCard";

export function HomePage() {
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const stats = platformStats(issues);
  const cats = categoryBreakdown(issues);
  const months = monthlyTrend(issues);
  const maxMonth = Math.max(1, ...months.map((m) => m.resolved));
  const [hello, setHello] = useState("Hello");
  useEffect(() => setHello(greeting()), []);
  const area = user?.area ?? "East Legon";
  const nearby = issues.filter((i) => i.location.area === area);
  const nearbyOpen = nearby.filter((i) => STATUS_META[i.status].layer !== "completed");
  const nearbyProgress = nearby.filter((i) => STATUS_META[i.status].layer === "progress");
  const nearbyDone = nearby.filter((i) => STATUS_META[i.status].layer === "completed");
  const completed = issues.filter((i) => STATUS_META[i.status].layer === "completed").slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-5 md:py-8">
      <section className="animate-civic-in relative overflow-hidden rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground shadow-[0_24px_50px_-28px_rgb(13_79_60/0.8)]">
        <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-gold/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm font-semibold text-primary-foreground/80">
          {hello} {user ? user.name.split(" ")[0] : "there"} 👋
        </p>
        <h1 className="mt-2 font-heading text-[2rem] leading-tight font-extrabold">
          Make your community better.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-primary-foreground/80">
          Report problems, track progress and explore what is happening around you.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/report"
            prefetch={false}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gold px-5 text-sm font-bold text-gold-foreground"
          >
            <Plus className="size-4" />
            Report an Issue
          </Link>
          <Link
            href="/map"
            prefetch={false}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/12 px-5 text-sm font-bold text-white ring-1 ring-white/25"
          >
            <Map className="size-4" />
            Explore Civic Map
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="Nearby" value={nearby.length} hint={`${area}`} />
        <StatCard label="In Progress" value={nearbyProgress.length} />
        <StatCard label="Resolved" value={nearbyDone.length} tone="green" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/road-assist" className="card-lift animate-civic-in flex items-center gap-4 rounded-[1.6rem] bg-card p-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-xl">🚗</span>
          <div>
            <p className="font-heading font-bold">Road Assist</p>
            <p className="text-sm text-muted-foreground">Safer routes using live civic road data.</p>
          </div>
        </Link>
        <Link href="/my-reports" className="card-lift flex items-center gap-4 rounded-[1.6rem] bg-card p-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-xl">
            <ShieldCheck className="size-5 text-primary" />
          </span>
          <div>
            <p className="font-heading font-bold">Track &amp; verify</p>
            <p className="text-sm text-muted-foreground">Follow work from report to citizen check.</p>
          </div>
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-heading text-xl font-bold">Around {area}</h2>
          <Link href="/map" className="text-sm font-semibold text-primary">
            Open map
          </Link>
        </div>
        {nearbyOpen.length === 0 ? (
          <EmptyState
            title="No reports yet"
            body="Your community is looking quiet."
            actionHref="/report"
            actionLabel="Report an Issue"
          />
        ) : (
          <div className="grid gap-3">
            {nearbyOpen.slice(0, 4).map((issue) => (
              <Link key={issue.id} href={`/issues/${issue.id}`} className="card-lift flex gap-3 rounded-[1.5rem] bg-card p-2.5">
                <IssuePhoto photoKey={issue.photoKey} className="h-[4.6rem] w-[5.4rem] shrink-0 rounded-2xl" />
                <div className="min-w-0 py-1">
                  <p className="truncate font-semibold">{issue.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{issue.location.publicLabel}</p>
                  <StatusPill status={issue.status} className="mt-2" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl font-bold">Completed work</h2>
        <div className="grid gap-3">
          {completed.map((issue) => (
            <Link key={issue.id} href={`/issues/${issue.id}`} className="card-lift rounded-[1.5rem] bg-card p-4">
              <p className="font-semibold">✓ {issue.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {getAgency(issue.agencyId)?.name} · {issue.location.area}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card-lift rounded-[1.8rem] bg-card p-5">
        <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">National civic snapshot</p>
        <h2 className="mt-1 font-heading text-xl font-bold">Ghana public work at a glance</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="Open" value={stats.open} />
          <Mini label="Completed" value={stats.completed} />
          <Mini label="Verified" value={stats.verified} />
          <Mini label="Road reports" value={stats.road} />
        </div>
        <div className="mt-5">
          <p className="text-sm font-bold">Category breakdown</p>
          <ul className="mt-2 space-y-2">
            {cats.slice(0, 5).map((c) => {
              const meta = CATEGORY_META[c.id as keyof typeof CATEGORY_META];
              const pct = Math.round((c.count / Math.max(1, stats.total)) * 100);
              return (
                <li key={c.id}>
                  <div className="mb-1 flex justify-between text-xs font-semibold">
                    <span>
                      {meta?.icon} {meta?.label}
                    </span>
                    <span>{c.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-5">
          <p className="text-sm font-bold">Resolution trend</p>
          <div className="mt-3 flex h-20 items-end gap-2">
            {months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gold"
                  style={{ height: `${(m.resolved / maxMonth) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] font-bold text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
        <Link href="/map" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <Navigation className="size-4" />
          Explore the civic map
        </Link>
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-secondary/70 px-3 py-3">
      <p className="font-heading text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
