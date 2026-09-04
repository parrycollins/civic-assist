"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchAccraPlaces, type GeocodeHit } from "@/lib/routing";
import { cn } from "@/lib/utils";

const CURRENT_ORIGIN = /current location|approximate current/i;

export function PlaceSearchField({
  label,
  value,
  onChange,
  onPick,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (hit: GeocodeHit) => void;
  placeholder: string;
  className?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef(0);
  const [hits, setHits] = useState<GeocodeHit[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const skip = value.trim().length < 2 || CURRENT_ORIGIN.test(value);

  useEffect(() => {
    if (skip) return;
    const q = value.trim();
    const handle = window.setTimeout(() => {
      const req = ++reqRef.current;
      setSearching(true);
      void searchAccraPlaces(q).then((next) => {
        if (req !== reqRef.current) return;
        setHits(next);
        setOpen(true);
        setSearching(false);
      });
    }, 320);
    return () => window.clearTimeout(handle);
  }, [skip, value]);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative min-w-0 flex-1", className)}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => hits.length && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-label={label}
        aria-expanded={open && !skip}
        aria-controls={listId}
        className="h-12 w-full rounded-2xl bg-secondary px-4 text-base outline-none"
      />
      {open && !skip && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-[20] mt-1 max-h-56 w-full overflow-auto rounded-2xl bg-card py-1 shadow-[0_16px_40px_-22px_rgb(16_32_24/0.45)]"
        >
          {searching && hits.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">Searching Greater Accra…</li>
          )}
          {!searching && hits.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No Greater Accra match. Try a neighbourhood, landmark, or street.
            </li>
          )}
          {hits.map((hit) => (
            <li key={`${hit.source}-${hit.label}-${hit.lat}`}>
              <button
                type="button"
                role="option"
                aria-selected="false"
                className="flex w-full flex-col items-start px-4 py-2.5 text-left text-sm hover:bg-secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(hit);
                  setOpen(false);
                }}
              >
                <span className="font-semibold">{hit.label}</span>
                <span className="text-[11px] text-muted-foreground">
                  {hit.source === "local" ? "Accra place" : "Greater Accra"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export async function firstAccraPlace(query: string): Promise<GeocodeHit | null> {
  const q = query.trim();
  if (q.length < 2 || CURRENT_ORIGIN.test(q)) return null;
  const hits = await searchAccraPlaces(q);
  return hits[0] ?? null;
}
