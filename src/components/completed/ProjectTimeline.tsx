import { formatDate } from "@/lib/format";
import { workMilestones } from "@/lib/completed";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/types";

export function ProjectTimeline({ issue }: { issue: Issue }) {
  const steps = workMilestones(issue);
  return (
    <section className="card-lift rounded-[1.7rem] bg-card p-5">
      <h2 className="font-heading text-xl font-extrabold">Timeline</h2>
      <p className="mt-1 text-sm text-muted-foreground">From the original report through completed work.</p>
      <ol className="mt-5">
        {steps.map((step, index) => (
          <li key={step.key} className="grid grid-cols-[1.15rem_1fr] gap-3">
            <span className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 size-3 rounded-full",
                  step.done ? "bg-primary civic-check" : "bg-border",
                )}
              />
              {index < steps.length - 1 ? (
                <span className={cn("mt-1 w-px flex-1 min-h-8", step.done ? "bg-primary/40" : "bg-border")} />
              ) : null}
            </span>
            <div className={cn("pb-5", index === steps.length - 1 && "pb-0")}>
              <p className={cn("font-heading font-bold", !step.done && "text-muted-foreground")}>{step.title}</p>
              <p className="text-sm text-muted-foreground">
                {step.done && step.at ? formatDate(step.at) : "Not recorded"}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
