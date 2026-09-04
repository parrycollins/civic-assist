"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ImpactStatCard({
  value,
  label,
  hint,
  icon,
}: {
  value: string | number;
  label: string;
  hint?: string;
  icon?: string;
}) {
  const numeric = typeof value === "number";
  const [shown, setShown] = useState(numeric ? 0 : value);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (!numeric) return;
    const target = value;
    const start = performance.now();
    const duration = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      setShown(Math.round(target * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [numeric, value]);

  return (
    <div className="card-lift animate-civic-in rounded-[1.5rem] bg-card p-4">
      {icon ? <p className="text-lg">{icon}</p> : null}
      <p className="font-heading text-3xl font-extrabold tracking-tight">{numeric ? shown : value}</p>
      <p className="mt-1 text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">{label}</p>
      {hint ? <p className={cn("mt-1 text-xs text-muted-foreground")}>{hint}</p> : null}
    </div>
  );
}
