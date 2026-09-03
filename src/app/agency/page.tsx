"use client";

import { AgencyDashboard } from "@/components/agency/AgencyDashboard";
import { useCivicStore } from "@/lib/store";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Page() {
  const user = useCivicStore((s) => s.user);
  if (!user || user.role !== "agency") {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <h1 className="font-heading text-xl font-semibold">Agency workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with an agency account to update complaints, upload evidence, and view performance.
        </p>
        <Link href="/login" className={cn(buttonVariants(), "mt-4")}>
          Agency sign in
        </Link>
      </div>
    );
  }
  return <AgencyDashboard />;
}
