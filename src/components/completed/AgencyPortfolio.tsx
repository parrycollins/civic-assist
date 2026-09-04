"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getAgency } from "@/data/agencies";
import { BeforeAfter } from "@/components/completed/BeforeAfter";
import { CompletedCard } from "@/components/completed/CompletedCard";
import { CATEGORY_META } from "@/lib/constants";
import { ErrorState } from "@/components/ui-kit/ErrorState";
import { ProgressRing } from "@/components/ui-kit/ProgressRing";
import { completedWorks, yearArchive } from "@/lib/completed";
import { agencyPerformance, categoryBreakdown, monthlyTrend } from "@/lib/performance";
import { useCivicStore } from "@/lib/store";

export function AgencyPortfolio() {
  const params = useParams<{ id: string }>();
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const agency = getAgency(params.id);
  if (!agency) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState
          title="Agency not found"
          body="That authority is not in the CivicGH directory."
          actionHref="/completed"
          actionLabel="Completed work"
        />
      </div>
    );
  }
  const mine = issues.filter((i) => i.agencyId === agency.id);
  const done = completedWorks(mine);
  const stats = agencyPerformance(issues, agency.id);
  const years = yearArchive(mine);
  const verifiedShare = stats.resolved ? (stats.citizenVerified / stats.resolved) * 100 : 0;
  const categories = categoryBreakdown(done);
  const months = monthlyTrend(mine);
  const maxMonth = Math.max(1, ...months.map((m) => Math.max(m.received, m.resolved)));
  const featured = done.find((issue) => issue.evidence.some((e) => e.stage === "after")) ?? done[0];
  const categoryMax = Math.max(1, ...categories.map((item) => item.count));

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">Civic work record</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold">{agency.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {agency.shortName} · {agency.type} · {agency.municipality}
        </p>
      </div>
      <section className="card-lift grid gap-5 rounded-[1.7rem] bg-card p-5 sm:grid-cols-[auto_1fr]">
        <ProgressRing value={verifiedShare} label="Citizen verified" />
        <div className="grid grid-cols-2 gap-3">
          <Mini label="Completed works" value={done.length} />
          <Mini label="Citizen verified" value={`${Math.round(verifiedShare)}%`} />
          <Mini label="Reports received" value={stats.received} />
          <Mini label="Resolved reports" value={stats.resolved} />
          <Mini label="Avg. resolution" value={`${stats.averageResolutionDays || 0} days`} />
          <Mini label="In progress" value={stats.inProgress} />
        </div>
      </section>

      {featured ? (
        <section className="card-lift overflow-hidden rounded-[1.6rem] bg-card p-5">
          <h2 className="font-heading text-lg font-extrabold">Before / after evidence</h2>
          <p className="mt-1 text-sm text-muted-foreground">From this agency’s most recent documented completion.</p>
          <div className="mt-4">
            <BeforeAfter issue={featured} />
          </div>
        </section>
      ) : null}

      {categories.length > 0 ? (
        <section className="card-lift rounded-[1.6rem] bg-card p-5">
          <h2 className="font-heading text-lg font-extrabold">Work completed</h2>
          <ul className="mt-3 grid gap-3">
            {categories.map((item) => (
              <li key={item.id}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {CATEGORY_META[item.id as keyof typeof CATEGORY_META]?.icon}{" "}
                    {CATEGORY_META[item.id as keyof typeof CATEGORY_META]?.label ?? item.id}
                  </span>
                  <span className="font-heading text-xl font-extrabold">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{ width: `${(item.count / categoryMax) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card-lift rounded-[1.6rem] bg-card p-5">
        <h2 className="font-heading text-lg font-extrabold">Projects by year</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {years.map((y) => (
            <Link
              key={y.year}
              href={`/completed?year=${y.year}&agency=${agency.id}`}
              className="rounded-2xl bg-secondary/70 px-3 py-3 transition-transform active:scale-[0.99]"
            >
              <p className="font-heading text-2xl font-extrabold">{y.count}</p>
              <p className="text-xs text-muted-foreground">{y.year}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card-lift rounded-[1.6rem] bg-card p-5">
        <h2 className="font-heading text-lg font-extrabold">Resolution trend</h2>
        <div className="mt-4 flex h-28 items-end gap-2">
          {months.map((m) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end gap-0.5">
                <div className="flex-1 rounded-t bg-primary/70" style={{ height: `${(m.received / maxMonth) * 100}%` }} />
                <div className="flex-1 rounded-t bg-gold" style={{ height: `${(m.resolved / maxMonth) * 100}%` }} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Green = reports received · Gold = completed that month</p>
      </section>

      {done.length === 0 ? (
        <p className="text-sm text-muted-foreground">This agency has no completed CivicGH records yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {done.map((issue) => (
            <CompletedCard key={issue.id} issue={issue} viewer={user} />
          ))}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="rounded-2xl bg-secondary/70 px-3 py-3">
      <p className="font-heading text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
