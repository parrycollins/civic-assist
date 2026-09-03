import Link from "next/link";
import { citizenImpact } from "@/lib/completed";
import { formatDate } from "@/lib/format";
import type { Issue, User } from "@/lib/types";

export function MyCivicImpact({
  issues,
  user,
  myIssueIds,
}: {
  issues: Issue[];
  user: User | null;
  myIssueIds: string[];
}) {
  const impact = citizenImpact(issues, user, myIssueIds);
  if (!user) {
    return (
      <section className="card-lift rounded-[1.6rem] bg-card p-5">
        <h2 className="font-heading text-xl font-bold">My Civic Impact</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to see the problems you helped bring to attention.</p>
        <Link href="/login" className="mt-3 inline-flex text-sm font-bold text-primary">
          Sign in
        </Link>
      </section>
    );
  }
  const done = impact.mine.filter((i) => i.status === "resolved" || i.status === "verified");
  return (
    <section className="card-lift rounded-[1.6rem] bg-card p-5">
      <h2 className="font-heading text-xl font-bold">My Civic Impact</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Mini label="Reports submitted" value={impact.submitted} />
        <Mini label="Problems resolved" value={impact.resolved} />
        <Mini label="Currently active" value={impact.active} />
        <Mini label="Other" value={impact.other} />
      </div>
      <div className="mt-4 space-y-2">
        {done.slice(0, 3).map((issue) => (
          <Link key={issue.id} href={`/completed/${issue.id}`} className="block rounded-2xl bg-secondary/70 px-3 py-3">
            <p className="font-semibold">Your report · {issue.title}</p>
            <p className="text-xs text-muted-foreground">
              Reported {formatDate(issue.reportedAt)} · {issue.status === "verified" ? "✓ Verified" : "Awaiting verification"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-secondary/70 px-3 py-2">
      <p className="font-heading text-xl font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
