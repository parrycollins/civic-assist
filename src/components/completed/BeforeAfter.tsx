"use client";

import { useState } from "react";
import { IssuePhoto } from "@/components/issues/IssuePhoto";
import { firstEvidence } from "@/lib/completed";
import type { Issue } from "@/lib/types";

export function BeforeAfter({ issue }: { issue: Issue }) {
  const before = firstEvidence(issue, "before");
  const after = firstEvidence(issue, "after") ?? issue.evidence.at(-1);
  const [split, setSplit] = useState(52);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-[1.4rem] sm:hidden">
        <IssuePhoto
          photoKey={before?.photoKey ?? issue.photoKey}
          imageDataUrl={before?.imageDataUrl}
          stage="before"
          className="h-44 w-full"
          caption="Before"
        />
        <IssuePhoto
          photoKey={after?.photoKey ?? issue.photoKey}
          imageDataUrl={after?.imageDataUrl}
          stage={after?.stage ?? "after"}
          className="h-44 w-full"
          caption="After"
        />
      </div>

      <div className="relative hidden h-56 overflow-hidden rounded-[1.4rem] sm:block">
        <IssuePhoto
          photoKey={after?.photoKey ?? issue.photoKey}
          imageDataUrl={after?.imageDataUrl}
          stage={after?.stage ?? "after"}
          className="absolute inset-0 h-full w-full"
          caption="After"
        />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        >
          <IssuePhoto
            photoKey={before?.photoKey ?? issue.photoKey}
            imageDataUrl={before?.imageDataUrl}
            stage="before"
            className="h-full w-full"
            caption="Before"
          />
        </div>
        <div className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white/90 shadow" style={{ left: `${split}%` }}>
          <span className="absolute top-1/2 left-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs font-bold text-primary shadow">
            ⟷
          </span>
        </div>
        <input
          type="range"
          min={8}
          max={92}
          value={split}
          onChange={(event) => setSplit(Number(event.target.value))}
          aria-label="Compare before and after"
          className="absolute inset-0 z-20 cursor-ew-resize opacity-0"
        />
        <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          Before
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          After
        </span>
      </div>
    </div>
  );
}
