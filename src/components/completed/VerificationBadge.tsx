import { CheckCircle2 } from "lucide-react";
import { verificationLabel } from "@/lib/completed";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/types";

export function VerificationBadge({ issue, className }: { issue: Issue; className?: string }) {
  const verified = issue.status === "verified";
  const awaiting = issue.status === "resolved";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
        verified && "bg-primary/10 text-primary",
        awaiting && "bg-gold/15 text-gold-foreground",
        !verified && !awaiting && "bg-secondary text-muted-foreground",
        className,
      )}
    >
      {verified ? <CheckCircle2 className="size-3.5" /> : null}
      {verificationLabel(issue)}
    </span>
  );
}
