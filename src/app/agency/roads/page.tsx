"use client";

import { AgencyRoads } from "@/components/agency/AgencyRoads";
import { useCivicStore } from "@/lib/store";
import Link from "next/link";

export default function Page() {
  const user = useCivicStore((s) => s.user);
  if (!user?.agencyId) {
    return (
      <div className="px-4 py-10 text-center text-sm">
        Sign in as an agency officer.{" "}
        <Link href="/login" className="text-primary">
          Sign in
        </Link>
      </div>
    );
  }
  return <AgencyRoads />;
}
