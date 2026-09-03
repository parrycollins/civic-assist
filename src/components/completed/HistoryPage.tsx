"use client";

import Link from "next/link";
import { yearArchive } from "@/lib/completed";
import { useCivicStore } from "@/lib/store";

export function HistoryPage() {
  const issues = useCivicStore((s) => s.issues);
  const years = yearArchive(issues);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">Permanent archive</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold">Civic Work History</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Counts come only from completed records already in CivicGH. Years without completed work show zero.
        </p>
      </div>
      <ul className="grid gap-3">
        {years.map((item) => (
          <li key={item.year}>
            <Link href={`/completed?year=${item.year}`} className="card-lift flex items-end justify-between rounded-[1.5rem] bg-card p-5">
              <span>
                <span className="block font-heading text-3xl font-extrabold">{item.year}</span>
                <span className="text-sm text-muted-foreground">Tap to explore this year</span>
              </span>
              <span className="text-right">
                <span className="block font-heading text-2xl font-extrabold">{item.count}</span>
                <span className="text-xs text-muted-foreground">projects completed</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
