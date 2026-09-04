import { STATUS_META } from "@/lib/constants";
import type { IssueStatus, TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const STAGES: { id: IssueStatus; label: string; description: string }[] = [
  { id: "reported", label: "Reported", description: "Stored in CivicGH Cloud until five nearby complaints are reached." },
  { id: "assigned", label: "Assigned", description: "An agency has accepted the work." },
  { id: "in_progress", label: "Work in progress", description: "Crews are on site or scheduled." },
  { id: "resolved", label: "Resolved", description: "The agency marked the work complete." },
  { id: "verified", label: "Citizen verification", description: "Residents confirm the repair." },
];

function stageIndex(status: IssueStatus) {
  if (status === "disputed") return 0;
  if (status === "reported" || status === "under_review") return 0;
  if (status === "assigned") return 1;
  if (status === "in_progress") return 2;
  if (status === "resolved") return 3;
  if (status === "verified") return 4;
  return 0;
}

export function StatusTrack({
  status,
  events,
}: {
  status: IssueStatus;
  events: TimelineEvent[];
}) {
  const current = stageIndex(status);
  const disputed = status === "disputed";

  return (
    <ol className="space-y-0">
      {STAGES.map((stage, i) => {
        const done = !disputed && i < current;
        const active = !disputed && i === current;
        const event = [...events].reverse().find((e) => e.status === stage.id);
        const meta = STATUS_META[stage.id];
        return (
          <li key={stage.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full text-sm font-extrabold",
                  done && "bg-primary text-primary-foreground",
                  active && "ring-4 ring-primary/15",
                  !done && !active && "bg-secondary text-muted-foreground",
                )}
                style={
                  active
                    ? { background: meta.fill, color: meta.color }
                    : undefined
                }
                aria-hidden
              >
                {done ? "✓" : active ? (stage.id === "in_progress" ? "●" : "○") : "○"}
              </span>
              {i < STAGES.length - 1 && (
                <span className={cn("w-px flex-1", done ? "bg-primary" : "bg-border")} />
              )}
            </div>
            <div className={cn("pb-5", i === STAGES.length - 1 && "pb-0")}>
              <p className="font-heading font-bold">{stage.label}</p>
              <p className="text-sm text-muted-foreground">{stage.description}</p>
              {event && (
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {event.actor}
                </p>
              )}
            </div>
          </li>
        );
      })}
      {disputed && (
        <li className="mt-1 rounded-2xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-900 dark:bg-orange-950/40 dark:text-orange-100">
          This complaint was reopened after a citizen dispute.
        </li>
      )}
    </ol>
  );
}
