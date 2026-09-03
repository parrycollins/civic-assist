import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_18px_-10px_rgb(13_79_60/0.8)]">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path
            fill="currentColor"
            d="M12 2.5 4.8 6.2v5.4c0 5 3.2 8.7 7.2 10 4-1.3 7.2-5 7.2-10V6.2L12 2.5Zm0 3.1 5.2 2.6v3.4c0 3.6-2.1 6.4-5.2 7.5-3.1-1.1-5.2-3.9-5.2-7.5V8.2L12 5.6Z"
          />
          <circle cx="12" cy="12.2" r="2.1" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-heading text-lg font-extrabold tracking-tight">CivicGH</span>
          <span className="block text-[11px] font-medium text-muted-foreground">Ghana civic services</span>
        </span>
      )}
    </div>
  );
}
