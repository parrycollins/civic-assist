import { STATUS_META } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";
import type { TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

export function IssueTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="space-y-0">
      {events.map((event, i) => {
        const statusMeta =
          event.status in STATUS_META
            ? STATUS_META[event.status as keyof typeof STATUS_META]
            : undefined;
        return (
          <li key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className="flex size-8 items-center justify-center rounded-full border text-xs font-bold"
                style={{
                  background: statusMeta?.fill ?? "#e2e8f0",
                  color: statusMeta?.color ?? "#0f172a",
                  borderColor: statusMeta?.color ?? "#94a3b8",
                }}
              >
                {statusMeta?.glyph ?? "•"}
              </span>
              {i < events.length - 1 && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn("pb-5", i === events.length - 1 && "pb-0")}>
              <p className="font-semibold">{event.label}</p>
              <p className="text-sm text-muted-foreground">{formatShortDate(event.timestamp)}</p>
              <p className="text-xs text-muted-foreground">{event.actor}</p>
              {event.note && <p className="mt-1 text-sm">{event.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
