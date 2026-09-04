import { Suspense } from "react";
import { ArchiveSkeleton } from "@/components/completed/ArchiveSkeleton";
import { CompletedWorkPage } from "@/components/completed/CompletedWorkPage";

export default function Page() {
  return (
    <Suspense fallback={<ArchiveSkeleton />}>
      <CompletedWorkPage />
    </Suspense>
  );
}
