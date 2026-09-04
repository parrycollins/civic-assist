import { cn } from "@/lib/utils";

export function YearFilter({
  years,
  olderCount,
  value,
  onChange,
}: {
  years: { year: number; count: number }[];
  olderCount: number;
  value: number | "all" | "older";
  onChange: (value: number | "all" | "older") => void;
}) {
  const chips: { id: number | "all" | "older"; label: string; count: number }[] = [
    { id: "all", label: "All years", count: years.reduce((sum, y) => sum + y.count, 0) + olderCount },
    ...years.map((y) => ({ id: y.year, label: String(y.year), count: y.count })),
    { id: "older", label: "Older", count: olderCount },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by year">
      {chips.map((chip) => (
        <button
          key={String(chip.id)}
          type="button"
          role="tab"
          aria-selected={value === chip.id}
          onClick={() => onChange(chip.id)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
            value === chip.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
          )}
        >
          {chip.label}
          <span className="ml-1 font-semibold opacity-70">{chip.count}</span>
        </button>
      ))}
    </div>
  );
}
