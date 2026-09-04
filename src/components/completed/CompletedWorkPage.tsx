"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AGENCIES } from "@/data/agencies";
import { AgencyCard } from "@/components/completed/AgencyCard";
import { ArchiveSkeleton } from "@/components/completed/ArchiveSkeleton";
import { BeforeAfter } from "@/components/completed/BeforeAfter";
import { CompletedCard } from "@/components/completed/CompletedCard";
import { ImpactStatCard } from "@/components/completed/ImpactStatCard";
import { VerificationBadge } from "@/components/completed/VerificationBadge";
import { YearFilter } from "@/components/completed/YearFilter";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { CATEGORY_META } from "@/lib/constants";
import {
  agenciesWithCompleted,
  archiveImpact,
  completedAt,
  completedWorks,
  filterCompleted,
  olderCompletedCount,
  publicReporterLabel,
  yearArchive,
  type CompletedFilters,
} from "@/lib/completed";
import { formatDate, formatShortDate } from "@/lib/format";
import { useCivicStore } from "@/lib/store";

const EMPTY_FILTERS: CompletedFilters = {
  category: "all",
  municipality: "all",
  area: "all",
  agencyId: "all",
  year: "all",
};

function yearFromParam(value: string | null): CompletedFilters["year"] {
  if (value === "older") return "older";
  if (value && Number(value)) return Number(value);
  return "all";
}

const emptySubscribe = () => () => {};

export function CompletedWorkPage({
  initialYear,
  initialAgency,
}: {
  initialYear?: number;
  initialAgency?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const ready = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const year = initialYear ?? yearFromParam(params.get("year"));
  const agencyId = initialAgency ?? params.get("agency") ?? "all";
  const filters: CompletedFilters = {
    ...EMPTY_FILTERS,
    year,
    agencyId,
  };

  const allCompleted = useMemo(() => completedWorks(issues), [issues]);
  const list = useMemo(
    () => filterCompleted(issues, { ...EMPTY_FILTERS, year, agencyId }),
    [issues, year, agencyId],
  );
  const years = yearArchive(issues);
  const olderCount = olderCompletedCount(issues);
  const overall = archiveImpact(issues);
  const filteredImpact = archiveImpact(list);
  const agencies = agenciesWithCompleted(filters.year === "all" && filters.agencyId === "all" ? issues : list);
  const featuredPool = filters.year === "all" && filters.agencyId === "all" ? allCompleted : list;
  const featured =
    featuredPool.find((issue) => issue.status === "verified" && issue.evidence.some((e) => e.stage === "after")) ??
    featuredPool[0];
  const timeline = featuredPool.slice(0, 8);
  const yearLabel =
    filters.year === "older" ? "Older civic impact" : filters.year === "all" ? null : `${filters.year} Civic Impact`;
  const agencyName = AGENCIES.find((a) => a.id === filters.agencyId)?.name;

  function setYear(nextYear: CompletedFilters["year"]) {
    const next = new URLSearchParams(params.toString());
    if (nextYear === "all") next.delete("year");
    else next.set("year", String(nextYear));
    const query = next.toString();
    router.replace(query ? `/completed?${query}` : "/completed", { scroll: false });
  }

  if (!ready) return <ArchiveSkeleton />;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      <header className="animate-civic-in relative overflow-hidden rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground shadow-[0_24px_50px_-28px_rgb(13_79_60/0.8)]">
        <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-gold/20 blur-2xl" />
        <p className="text-xs font-bold tracking-[0.16em] text-gold uppercase">Civic achievement record</p>
        <h1 className="mt-2 font-heading text-[2rem] leading-tight font-extrabold">Completed Works</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/80">
          See the problems your community reported — and the work that was completed.
        </p>
      </header>

      <section>
        <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">Civic Impact</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Counted from live CivicGH records. Years without work stay at 0.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ImpactStatCard icon="🏆" value={overall.completed} label="Works completed" />
          <ImpactStatCard icon="📣" value={overall.completed} label="Citizen reports resolved" />
          <ImpactStatCard icon="🏛️" value={overall.agencies} label="Agencies involved" />
          <ImpactStatCard
            icon="✓"
            value={`${overall.verifiedShare}%`}
            label="Citizen verified"
            hint={`${overall.verified} of ${overall.completed} completed`}
          />
        </div>
      </section>

      {featured ? (
        <section className="card-lift animate-civic-in overflow-hidden rounded-[1.8rem] bg-card">
          <p className="px-5 pt-5 text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
            Featured completed work
          </p>
          <div className="p-5 pt-3">
            <BeforeAfter issue={featured} />
            <p className="mt-4 text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
              {CATEGORY_META[featured.category].label}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold">{featured.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">📍 {featured.location.publicLabel}</p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <Meta label="Completed by" value={AGENCIES.find((a) => a.id === featured.agencyId)?.name ?? "Agency"} />
              <Meta label="Reported by" value={publicReporterLabel(featured, user)} />
              <Meta label="Completed" value={formatDate(completedAt(featured))} />
              <div>
                <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Status</dt>
                <dd className="mt-1">
                  <VerificationBadge issue={featured} />
                </dd>
              </div>
            </dl>
            <Link
              href={`/completed/${featured.id}`}
              className="pressable mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground sm:w-auto sm:px-8"
            >
              View Project
            </Link>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-extrabold">All completed work</h2>
            <p className="text-sm text-muted-foreground">You reported it. They fixed it.</p>
          </div>
          <Link href="/completed/history" className="text-sm font-bold text-primary">
            History
          </Link>
        </div>
        <YearFilter years={years} olderCount={olderCount} value={filters.year} onChange={setYear} />
        {agencyName ? (
          <p className="text-sm text-muted-foreground">
            Showing completed work by <span className="font-semibold text-foreground">{agencyName}</span>.
          </p>
        ) : null}
        {yearLabel ? (
          <div className="card-lift rounded-[1.6rem] bg-card p-5">
            <p className="text-xs font-bold tracking-[0.14em] text-gold uppercase">Multi-year archive</p>
            <h3 className="mt-1 font-heading text-2xl font-extrabold">{yearLabel}</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="font-heading text-2xl font-extrabold">{filteredImpact.completed}</p>
                <p className="text-xs text-muted-foreground">Completed works</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-extrabold">{filteredImpact.agencies}</p>
                <p className="text-xs text-muted-foreground">Agencies</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-extrabold">{filteredImpact.verified}</p>
                <p className="text-xs text-muted-foreground">Citizen-verified</p>
              </div>
            </div>
          </div>
        ) : null}
        {list.length === 0 ? (
          <EmptyState
            title={yearLabel ? `No completed works in ${filters.year === "older" ? "earlier years" : filters.year}` : "No completed works yet"}
            body="Once community issues are resolved and verified, they'll appear here."
            actionHref="/map"
            actionLabel="Explore the civic map"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((issue) => (
              <CompletedCard key={issue.id} issue={issue} viewer={user} />
            ))}
          </div>
        )}
      </section>

      {timeline.length > 0 ? (
        <section className="card-lift rounded-[1.8rem] bg-card p-5">
          <h2 className="font-heading text-xl font-extrabold">Civic Impact Timeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">A civic achievement history, newest first.</p>
          <ol className="mt-5 space-y-0">
            {timeline.map((issue, index) => {
              const photo = issue.evidence.find((e) => e.stage === "after") ?? issue.evidence[0];
              return (
                <li key={issue.id} className="relative grid grid-cols-[1rem_1fr] gap-3 pb-5 last:pb-0">
                  <span className="relative mt-1.5 flex flex-col items-center">
                    <span className="size-3 rounded-full bg-gold" />
                    {index < timeline.length - 1 ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
                  </span>
                  <Link
                    href={`/completed/${issue.id}`}
                    className="pressable grid min-w-0 grid-cols-[4.5rem_1fr] gap-3 rounded-2xl bg-secondary/50 p-3"
                  >
                    <IssuePhoto
                      photoKey={photo?.photoKey ?? issue.photoKey}
                      imageDataUrl={photo?.imageDataUrl}
                      stage={photo?.stage ?? "after"}
                      className="h-16 w-full rounded-xl"
                      caption={CATEGORY_META[issue.category].label}
                    />
                    <span className="min-w-0">
                      <p className="text-[11px] font-bold text-muted-foreground">{formatShortDate(completedAt(issue))}</p>
                      <p className="font-heading font-bold">{issue.title}</p>
                      <p className="text-sm text-muted-foreground">
                        📍 {issue.location.area} · {AGENCIES.find((a) => a.id === issue.agencyId)?.shortName}
                      </p>
                      <span className="mt-2 inline-flex">
                        <VerificationBadge issue={issue} />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <section>
        <h2 className="font-heading text-xl font-extrabold">Agencies</h2>
        <p className="mt-1 text-sm text-muted-foreground">Authorities with completed CivicGH records.</p>
        {agencies.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No agency has a completed record in this dataset yet.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {agencies.map((agency) => (
              <AgencyCard
                key={agency.id}
                href={`/agencies/${agency.id}`}
                shortName={agency.shortName}
                name={agency.name}
                completed={agency.completed}
                verifiedShare={agency.verifiedShare}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}
