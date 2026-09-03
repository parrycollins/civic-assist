"use client";

import { useSearchParams } from "next/navigation";
import { CivicMapScreen } from "@/components/map/CivicMapScreen";

export function MapEntry() {
  const params = useSearchParams();
  return <CivicMapScreen layerMode={params.get("layer") === "completed" ? "completed" : undefined} />;
}
