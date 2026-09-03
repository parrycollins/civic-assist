import { Suspense } from "react";
import { CompletedWorkPage } from "@/components/completed/CompletedWorkPage";

export default function Page() {
  return (
    <Suspense>
      <CompletedWorkPage />
    </Suspense>
  );
}
