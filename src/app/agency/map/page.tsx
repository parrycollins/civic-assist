"use client";

import { CivicMapScreen } from "@/components/map/CivicMapScreen";
import { useCivicStore } from "@/lib/store";
import Link from "next/link";

export default function Page() {
  const user = useCivicStore((s) => s.user);
  if (!user?.agencyId) {
    return (
      <div className="px-4 py-10 text-center text-sm">
        Agency map requires an officer account.{" "}
        <Link href="/login" className="text-primary">
          Sign in
        </Link>
      </div>
    );
  }
  return (
    <div className="relative h-full min-h-[70dvh]">
      <CivicMapScreen mode="agency" agencyId={user.agencyId} />
    </div>
  );
}
