import type { EvidenceStage } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCENES: Record<string, { sky: string; ground: string; label: string }> = {
  drain: { sky: "#7EB6D9", ground: "#6B5B3B", label: "Drain" },
  pothole: { sky: "#8FBFDA", ground: "#4A4A4A", label: "Road" },
  flood: { sky: "#5B7C99", ground: "#3D6B8A", label: "Flooding" },
  waste: { sky: "#A9C7B0", ground: "#7A6A4F", label: "Waste" },
  light: { sky: "#1B2A4A", ground: "#2C3340", label: "Streetlight" },
  water: { sky: "#8BB8D0", ground: "#5C7A88", label: "Water" },
  construction: { sky: "#E0C48A", ground: "#6D6D6D", label: "Works" },
  infra: { sky: "#B7C9D6", ground: "#8A8F7A", label: "Infrastructure" },
};

function sceneKey(photoKey: string) {
  const k = photoKey.toLowerCase();
  if (k.includes("drain")) return "drain";
  if (k.includes("pothole")) return "pothole";
  if (k.includes("flood")) return "flood";
  if (k.includes("waste")) return "waste";
  if (k.includes("light")) return "light";
  if (k.includes("water")) return "water";
  if (k.includes("construction") || k.includes("road")) return "construction";
  return "infra";
}

function stageFromKey(photoKey: string, stage?: EvidenceStage): EvidenceStage {
  if (stage) return stage;
  if (photoKey.includes("during")) return "during";
  if (photoKey.includes("after")) return "after";
  return "before";
}

export function IssuePhoto({
  photoKey,
  stage,
  imageDataUrl,
  className,
  caption,
}: {
  photoKey: string;
  stage?: EvidenceStage;
  imageDataUrl?: string;
  className?: string;
  caption?: string;
}) {
  if (imageDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageDataUrl} alt={caption ?? "Evidence photo"} className={cn("h-full w-full object-cover", className)} />
    );
  }
  const scene = SCENES[sceneKey(photoKey)];
  const st = stageFromKey(photoKey, stage);
  const overlay =
    st === "before" ? "Problem" : st === "during" ? "Work in progress" : "Completed work";
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label={`${scene.label} — ${overlay}`}>
        <rect width="320" height="200" fill={scene.sky} />
        <rect y="120" width="320" height="80" fill={scene.ground} />
        {sceneKey(photoKey) === "drain" && (
          <>
            <rect x="40" y="128" width="240" height="36" rx="4" fill="#3F3A32" />
            {st === "before" && <rect x="50" y="134" width="220" height="24" fill="#6B5A2A" />}
            {st === "during" && (
              <>
                <rect x="90" y="90" width="40" height="50" fill="#F5C542" />
                <rect x="50" y="134" width="140" height="24" fill="#4A7C59" />
              </>
            )}
            {st === "after" && <rect x="50" y="138" width="220" height="16" fill="#3B82A8" />}
          </>
        )}
        {sceneKey(photoKey) === "pothole" && (
          <>
            <rect x="0" y="118" width="320" height="18" fill="#2F2F2F" />
            {st !== "after" && <ellipse cx="160" cy="150" rx={st === "during" ? 38 : 48} ry="22" fill="#1A1A1A" />}
            {st === "during" && <rect x="120" y="100" width="70" height="28" fill="#F5C542" />}
            {st === "after" && <rect x="110" y="138" width="100" height="16" fill="#5A5A5A" />}
          </>
        )}
        {sceneKey(photoKey) === "flood" && (
          <>
            <ellipse cx="160" cy="150" rx="130" ry="28" fill="#2C5F7C" opacity={st === "after" ? 0.25 : 0.9} />
            {st === "during" && <rect x="40" y="100" width="50" height="40" fill="#C2410C" />}
          </>
        )}
        {sceneKey(photoKey) === "waste" && (
          <>
            {st !== "after" && (
              <>
                <rect x="90" y="90" width="70" height="50" fill="#4B5563" />
                <circle cx="200" cy="140" r="18" fill="#365314" />
                <circle cx="230" cy="145" r="12" fill="#7C2D12" />
              </>
            )}
            {st === "during" && <rect x="40" y="110" width="60" height="30" fill="#16A34A" />}
            {st === "after" && <rect x="120" y="120" width="80" height="28" fill="#6B7280" />}
          </>
        )}
        {sceneKey(photoKey) === "light" && (
          <>
            <rect x="158" y="40" width="6" height="90" fill="#CBD5E1" />
            <circle cx="161" cy="36" r="12" fill={st === "after" ? "#FDE68A" : "#64748B"} />
            {st === "during" && <rect x="200" y="110" width="40" height="24" fill="#F5C542" />}
          </>
        )}
        {sceneKey(photoKey) === "water" && (
          <>
            <rect x="30" y="130" width="260" height="10" fill="#94A3B8" />
            {st !== "after" && <ellipse cx="120" cy="150" rx="50" ry="14" fill="#38BDF8" opacity="0.8" />}
            {st === "during" && <rect x="180" y="100" width="50" height="30" fill="#0369A1" />}
          </>
        )}
        {sceneKey(photoKey) === "construction" && (
          <>
            <rect x="0" y="124" width="320" height="12" fill="#F59E0B" />
            <polygon points="70,124 90,80 110,124" fill="#F97316" />
            {st !== "after" && <rect x="160" y="90" width="70" height="34" fill="#F5C542" />}
          </>
        )}
        {sceneKey(photoKey) === "infra" && (
          <>
            <rect x="90" y="70" width="140" height="70" fill="#94A3B8" />
            {st === "before" && <polygon points="120,90 200,90 160,130" fill="#7F1D1D" opacity="0.7" />}
            {st === "after" && <rect x="110" y="90" width="100" height="12" fill="#166534" />}
          </>
        )}
      </svg>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs font-medium text-white">
        {caption ?? overlay}
      </div>
    </div>
  );
}
