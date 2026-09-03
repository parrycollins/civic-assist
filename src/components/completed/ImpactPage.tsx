"use client";

import Link from "next/link";
import { AGENCIES } from "@/data/agencies";
import { civicImpact } from "@/lib/completed";
import { monthlyTrend } from "@/lib/performance";
import { useCivicStore } from "@/lib/store";

export function ImpactPage() {
  const issues = useCivicStore((s) => s.issues);
  const impact = civicImpact(issues);
  const months = monthlyTrend(issues);
  const max = Math.max(1, ...months.map((m) => Math.max(m.received, m.resolved)));

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">From CivicGH records</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold">CivicGH Impact</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          These totals are counted from the live civic dataset. Reported, agency-completed, and citizen-verified are
          listed separately.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Hero value={impact.reported} label="Problems reported" />
        <Hero value={impact.resolved} label="Problems resolved" />
        <Hero value={impact.verified} label="Citizen-verified resolutions" />
        <Hero value={impact.documented} label="Completed projects documented" />
        <Hero value={impact.agencies} label="Participating agencies" />
        <Hero value={AGENCIES.length} label="Agencies in the directory" />
      </div>
      <section className="card-lift rounded-[1.6rem] bg-card p-5">
        <h2 className="font-heading text-lg font-bold">Resolution trend</h2>
        <div className="mt-4 flex h-28 items-end gap-2">
          {months.map((m) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end gap-0.5">
                <div className="flex-1 rounded-t bg-primary/70" style={{ height: `${(m.received / max) * 100}%` }} />
                <div className="flex-1 rounded-t bg-gold" style={{ height: `${(m.resolved / max) * 100}%` }} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Green = reported · Gold = completed that month</p>
      </section>
      <Link href="/completed" className="inline-flex text-sm font-bold text-primary">
        Browse completed work
      </Link>
    </div>
  );
}

function Hero({ value, label }: { value: number; label: string }) {
  return (
    <div className="card-lift rounded-[1.5rem] bg-card p-4">
      <p className="font-heading text-3xl font-extrabold">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
