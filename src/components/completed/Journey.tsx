import type { Issue } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "reported", title: "Citizen reported the problem", icon: "📸" },
  { key: "received", title: "Agency received the complaint", icon: "🏛️" },
  { key: "started", title: "Work started", icon: "🚧" },
  { key: "progress", title: "Agency uploaded progress", icon: "📸" },
  { key: "done", title: "Work completed", icon: "✓" },
  { key: "verified", title: "Citizen verified", icon: "👍" },
] as const;

export function Journey({ issue, title = "You Reported It. They Fixed It." }: { issue: Issue; title?: string }) {
  const hasProgress = issue.evidence.some((e) => e.stage === "during");
  const done = issue.status === "resolved" || issue.status === "verified";
  const verified = issue.status === "verified";
  const started = issue.timeline.some((e) => e.status === "in_progress" || e.status === "work_started" || e.status === "assigned");
  const received = issue.timeline.some((e) => e.status !== "reported");
  const active = {
    reported: true,
    received,
    started,
    progress: hasProgress,
    done,
    verified,
  };

  return (
    <section className="card-lift rounded-[1.7rem] bg-card p-5">
      <h2 className="font-heading text-xl font-extrabold">{title}</h2>
      <ol className="mt-4 space-y-0">
        {STEPS.map((step, i) => {
          const on = active[step.key];
          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full text-sm",
                    on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {step.icon}
                </span>
                {i < STEPS.length - 1 && <span className={cn("w-px flex-1", on ? "bg-primary" : "bg-border")} />}
              </div>
              <p className={cn("pb-4 text-sm font-semibold", !on && "text-muted-foreground")}>{step.title}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function CivicStory({ issue }: { issue: Issue }) {
  const before = issue.evidence.find((e) => e.stage === "before");
  const during = issue.evidence.find((e) => e.stage === "during");
  const after = issue.evidence.find((e) => e.stage === "after");
  const beats = [
    { title: "The Problem", body: issue.description, photo: before },
    { title: "The Report", body: `${issue.reporterCount} citizen report${issue.reporterCount === 1 ? "" : "s"} opened this record.`, photo: before },
    { title: "The Response", body: issue.timeline.find((e) => e.status === "assigned" || e.status === "agency_accepted" || e.status === "under_review")?.label ?? (issue.forwardedToAgency ? "The responsible agency was notified." : "CivicGH Cloud is still gathering nearby reports."), photo: during },
    { title: "The Work", body: during?.description ?? "Crews recorded progress while the work was underway.", photo: during },
    { title: "The Result", body: after?.description ?? "Completed work evidence is kept with the original report.", photo: after },
    {
      title: "Citizen Verification",
      body:
        issue.status === "verified"
          ? "Citizens confirmed the repair."
          : issue.status === "resolved"
            ? "Waiting for citizens to confirm the work."
            : "This record is not treated as citizen-verified.",
      photo: after,
    },
  ];
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-extrabold">Civic Story</h2>
      {beats.map((beat) => (
        <article key={beat.title} className="card-lift rounded-[1.4rem] bg-card p-4">
          <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">{beat.title}</p>
          <p className="mt-1 text-sm leading-6">{beat.body}</p>
        </article>
      ))}
    </section>
  );
}
