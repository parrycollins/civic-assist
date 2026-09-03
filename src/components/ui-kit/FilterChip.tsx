import { cn } from "@/lib/utils";

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-card/90 text-foreground",
      )}
    >
      {label}
    </button>
  );
}
