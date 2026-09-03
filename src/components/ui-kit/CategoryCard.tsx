import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryCard({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-[1.2rem] bg-card px-3.5 py-3 text-left shadow-[0_10px_28px_-20px_rgb(16_32_24/0.45)] transition-colors",
        selected && "ring-2 ring-primary",
      )}
    >
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-md border-2",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
        )}
        aria-hidden
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <span className="font-heading text-sm font-bold">{label}</span>
    </button>
  );
}
