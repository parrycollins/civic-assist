import { Suspense } from "react";
import { MapEntry } from "@/components/map/MapEntry";

export default function MapPage() {
  return (
    <div className="relative h-full min-h-[70dvh]">
      <Suspense>
        <MapEntry />
      </Suspense>
    </div>
  );
}
