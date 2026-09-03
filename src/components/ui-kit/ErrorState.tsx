import Link from "next/link";
import { cn } from "@/lib/utils";

export function ErrorState({
  title,
  body,
  actionHref,
  actionLabel,
  onRetry,
  className,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[1.75rem] bg-card p-8 text-center card-lift", className)}>
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-red-50 text-2xl dark:bg-red-950/40">
        ⚠️
      </div>
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Try Again
        </button>
      )}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
