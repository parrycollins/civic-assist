import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "default" | "gold" | "green";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-lift rounded-3xl bg-card p-4",
        tone === "gold" && "ring-1 ring-gold/30",
        tone === "green" && "ring-1 ring-primary/15",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <span className="grid size-9 place-items-center rounded-2xl bg-secondary text-primary">{icon}</span>
        )}
      </div>
      <p className="mt-3 font-heading text-3xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
