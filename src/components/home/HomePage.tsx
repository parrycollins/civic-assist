"use client";

import Link from "next/link";
import { Map, Navigation, Megaphone, CheckCircle2 } from "lucide-react";
import { useCivicStore } from "@/lib/store";
import { platformStats } from "@/lib/performance";
import { STATUS_META } from "@/lib/constants";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { StatusPill } from "@/components/map/IssueSheet";
import { getAgency } from "@/data/agencies";

export function HomePage() {
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const stats = platformStats(issues);
  const completed = issues.filter((i) => STATUS_META[i.status].layer === "completed").slice(0, 3);
  const nearby = issues.filter((i) => i.location.area === (user?.area ?? "East Legon")).slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <section className="overflow-hidden rounded-3xl bg-primary px-5 py-8 text-primary-foreground">
        <p className="text-sm font-medium text-primary-foreground/80">CivicGH · Ghana</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          See the problem. Follow the work. Verify the result.
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-primary-foreground/85">
          CivicGH is a visual history of community problems and public-service work — not just a list of complaints.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href="/map"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-primary shadow-sm hover:bg-white/90"
          >
            <Map className="size-4" />
            Explore Civic Map
          </a>
          <a
            href="/road-assist"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/40 px-4 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Navigation className="size-4" />
            Road Assist
          </a>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [stats.open, "Open problems"],
          [stats.completed, "Completed work"],
          [stats.verified, "Citizen verified"],
          [stats.road, "Road conditions"],
        ].map(([n, label]) => (
          <div key={String(label)} className="rounded-2xl border p-3">
            <p className="font-heading text-2xl font-semibold">{n}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/report" className="flex items-start gap-3 rounded-2xl border p-4">
          <Megaphone className="mt-0.5 size-5 text-primary" />
          <div>
            <p className="font-semibold">Report a problem</p>
            <p className="text-sm text-muted-foreground">Photo, approximate GPS, and the responsible agency.</p>
          </div>
        </Link>
        <Link href="/my-reports" className="flex items-start gap-3 rounded-2xl border p-4">
          <CheckCircle2 className="mt-0.5 size-5 text-primary" />
          <div>
            <p className="font-semibold">Track &amp; verify</p>
            <p className="text-sm text-muted-foreground">Follow status from reported to citizen-verified.</p>
          </div>
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-heading text-lg font-semibold">
            {user?.area ? `Around ${user.area}` : "Around East Legon"}
          </h2>
          <Link href="/map" className="text-sm text-primary">
            Open map
          </Link>
        </div>
        <div className="grid gap-3">
          {nearby.map((issue) => (
            <Link key={issue.id} href={`/issues/${issue.id}`} className="flex gap-3 rounded-2xl border p-2">
              <IssuePhoto photoKey={issue.photoKey} className="h-20 w-24 shrink-0 rounded-xl" />
              <div className="min-w-0">
                <p className="truncate font-medium">{issue.title}</p>
                <p className="text-xs text-muted-foreground">{issue.location.publicLabel}</p>
                <StatusPill status={issue.status} className="mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold">Recently completed work</h2>
        <div className="grid gap-3">
          {completed.map((issue) => (
            <Link key={issue.id} href={`/issues/${issue.id}`} className="rounded-2xl border p-3">
              <p className="font-medium">🟢 {issue.title}</p>
              <p className="text-sm text-muted-foreground">
                {getAgency(issue.agencyId)?.name} · {issue.location.area}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
