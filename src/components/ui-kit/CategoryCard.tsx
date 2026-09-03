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
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex min-h-[6.5rem] flex-col items-start justify-between rounded-[1.4rem] bg-card p-4 text-left shadow-[0_10px_28px_-20px_rgb(16_32_24/0.45)] transition-transform active:scale-[0.98]",
        selected && "ring-2 ring-primary bg-primary text-primary-foreground",
      )}
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <span className="font-heading text-sm font-bold">{label}</span>
    </button>
  );
}
