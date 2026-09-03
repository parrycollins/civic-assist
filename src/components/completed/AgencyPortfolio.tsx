"use client";

import { useParams } from "next/navigation";
import { getAgency } from "@/data/agencies";
import { CompletedCard } from "@/components/completed/CompletedCard";
import { ErrorState } from "@/components/ui-kit/ErrorState";
import { ProgressRing } from "@/components/ui-kit/ProgressRing";
import { completedWorks, yearArchive } from "@/lib/completed";
import { agencyPerformance } from "@/lib/performance";
import { useCivicStore } from "@/lib/store";

export function AgencyPortfolio() {
  const params = useParams<{ id: string }>();
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const agency = getAgency(params.id);
  if (!agency) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorState title="Agency not found" body="That authority is not in the CivicGH directory." actionHref="/completed" actionLabel="Completed work" />
      </div>
    );
  }
  const mine = issues.filter((i) => i.agencyId === agency.id);
  const done = completedWorks(mine);
  const stats = agencyPerformance(issues, agency.id);
  const years = yearArchive(mine);
  const verifiedShare = stats.resolved ? (stats.citizenVerified / stats.resolved) * 100 : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">Agency portfolio</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold">{agency.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {agency.type} · {agency.municipality}
        </p>
      </div>
      <section className="card-lift grid gap-5 rounded-[1.7rem] bg-card p-5 sm:grid-cols-[auto_1fr]">
        <ProgressRing value={verifiedShare} label="Citizen verified" />
        <div className="grid grid-cols-2 gap-3">
          <Mini label="Total work completed" value={done.length} />
          <Mini label="Citizen verified" value={`${Math.round(verifiedShare)}%`} />
          {years.map((y) => (
            <Mini key={y.year} label={String(y.year)} value={y.count} />
          ))}
        </div>
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
