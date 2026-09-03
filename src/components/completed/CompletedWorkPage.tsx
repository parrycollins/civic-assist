"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AGENCIES } from "@/data/agencies";
import { AREAS } from "@/data/areas";
import { CompletedCard } from "@/components/completed/CompletedCard";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { CATEGORY_META } from "@/lib/constants";
import { civicImpact, filterCompleted, yearArchive, type CompletedFilters } from "@/lib/completed";
import { useCivicStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMPTY_FILTERS: CompletedFilters = {
  category: "all",
  municipality: "all",
  area: "all",
  agencyId: "all",
  year: "all",
};

export function CompletedWorkPage({
  initialYear,
  initialAgency,
}: {
  initialYear?: number;
  initialAgency?: string;
}) {
  const params = useSearchParams();
  const issues = useCivicStore((s) => s.issues);
  const user = useCivicStore((s) => s.user);
  const yearParam = params.get("year");
  const agencyParam = params.get("agency");
  const [filters, setFilters] = useState<CompletedFilters>({
    ...EMPTY_FILTERS,
    year: initialYear ?? (yearParam ? Number(yearParam) : "all"),
    agencyId: initialAgency ?? agencyParam ?? "all",
  });
  const [view, setView] = useState<"feed" | "gallery">("feed");
  const list = useMemo(() => filterCompleted(issues, filters), [issues, filters]);
  const years = yearArchive(issues);
  const impact = civicImpact(issues);
  const municipalities = [...new Set(issues.map((i) => i.location.municipality))].sort();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">Civic work archive</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold">Completed Work</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          A public record of problems that reached completion in CivicGH. Agency-confirmed and citizen-verified are
          not treated as the same state.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Mini label="Completed" value={impact.resolved} />
        <Mini label="Citizen-verified" value={impact.verified} />
        <Mini label="Awaiting check" value={impact.awaiting} />
        <Mini label="Documented after photos" value={impact.documented} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/completed/history" className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">
          Civic work history
        </Link>
        <Link href="/impact" className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">
          Civic impact
        </Link>
        <Link href="/map?layer=completed" className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">
          Show on map
        </Link>
      </div>

      <div className="card-lift grid gap-3 rounded-[1.5rem] bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          label="Category"
          value={filters.category}
          onChange={(v) => setFilters((f) => ({ ...f, category: v as CompletedFilters["category"] }))}
          options={[{ id: "all", label: "All" }, ...CATEGORIES.map((c) => ({ id: c, label: CATEGORY_META[c].label }))]}
        />
        <Select
          label="Municipality"
          value={filters.municipality}
          onChange={(v) => setFilters((f) => ({ ...f, municipality: v }))}
          options={[{ id: "all", label: "All" }, ...municipalities.map((m) => ({ id: m, label: m }))]}
        />
        <Select
          label="Community"
          value={filters.area}
          onChange={(v) => setFilters((f) => ({ ...f, area: v }))}
          options={[{ id: "all", label: "All" }, ...AREAS.map((a) => ({ id: a.name, label: a.name }))]}
        />
        <Select
          label="Agency"
          value={filters.agencyId}
          onChange={(v) => setFilters((f) => ({ ...f, agencyId: v }))}
          options={[{ id: "all", label: "All" }, ...AGENCIES.map((a) => ({ id: a.id, label: a.shortName }))]}
        />
        <Select
          label="Year"
          value={String(filters.year)}
          onChange={(v) => setFilters((f) => ({ ...f, year: v === "all" ? "all" : Number(v) }))}
          options={[{ id: "all", label: "All years" }, ...years.map((y) => ({ id: String(y.year), label: `${y.year} (${y.count})` }))]}
        />
      </div>

      <div className="flex gap-2">
        {(["feed", "gallery"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold",
              view === id ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            {id === "feed" ? "Feed" : "Gallery"}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No completed work in this view"
          body="CivicGH only lists records that agencies marked complete. Try another year, place, or category."
        />
      ) : (
        <div className={view === "gallery" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-4"}>
          {list.map((issue) => (
            <CompletedCard key={issue.id} issue={issue} viewer={user} />
          ))}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-lift rounded-[1.3rem] bg-card px-4 py-3">
      <p className="font-heading text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="grid gap-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
      {label}
      <select
        className="h-11 rounded-2xl bg-secondary px-3 text-sm font-semibold text-foreground"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
