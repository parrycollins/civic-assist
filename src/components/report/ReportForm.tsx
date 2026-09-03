"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AGENCIES } from "@/data/agencies";
import { CATEGORY_META } from "@/lib/constants";
import { approximateLocation } from "@/lib/geo";
import { useCivicStore } from "@/lib/store";
import type { Category, Severity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ReportForm({
  preset,
}: {
  preset?: { category?: Category; roadHazard?: string; title?: string };
}) {
  const router = useRouter();
  const user = useCivicStore((s) => s.user);
  const addIssue = useCivicStore((s) => s.addIssue);
  const [title, setTitle] = useState(preset?.title ?? "");
  const [category, setCategory] = useState<Category>(preset?.category ?? "roads");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [agencyId, setAgencyId] = useState("dur");
  const [photo, setPhoto] = useState<string | undefined>();
  const [coords, setCoords] = useState({ lat: 5.6037, lng: -0.187 });
  const [locLabel, setLocLabel] = useState("Accra (approximate)");

  function useLocation() {
    if (!navigator.geolocation) {
      toast.error("Location is not available.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const approx = approximateLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setCoords(approx);
        setLocLabel("Approximate GPS attached (exact location is not published)");
      },
      () => toast.message("Could not read GPS. You can still submit with the map location."),
    );
  }

  const road = useMemo(
    () => ["roads", "flooding"].includes(category) || Boolean(preset?.roadHazard),
    [category, preset],
  );

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!user) {
          router.push("/login");
          return;
        }
        if (!title.trim() || !description.trim()) {
          toast.error("Add a title and a short description.");
          return;
        }
        const issue = addIssue({
          title,
          category,
          description,
          lat: coords.lat,
          lng: coords.lng,
          imageDataUrl: photo,
          photoKey: `${category}-before`,
          isRoadRelated: road,
          roadHazard: preset?.roadHazard as never,
          severity,
          agencyId,
        });
        toast.success("Report submitted. The map will update immediately.");
        router.push(`/issues/${issue.id}`);
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="title">Issue title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blocked drain" />
      </div>
      <div className="grid gap-1.5">
        <Label>Category</Label>
        <select
          className="h-9 rounded-lg border px-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {Object.entries(CATEGORY_META).map(([id, meta]) => (
            <option key={id} value={id}>
              {meta.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="desc">What is happening?</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short public description. Do not include your address or phone number."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          Severity
          <select
            className="h-9 rounded-lg border px-2"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Agency
          <select
            className="h-9 rounded-lg border px-2"
            value={agencyId}
            onChange={(e) => setAgencyId(e.target.value)}
          >
            {AGENCIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.shortName}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-2 rounded-xl border p-3">
        <p className="text-sm font-medium">Location</p>
        <p className="text-xs text-muted-foreground">{locLabel}</p>
        <Button type="button" variant="outline" onClick={useLocation}>
          Use approximate GPS
        </Button>
        <p className="text-[11px] text-muted-foreground">
          CivicGH never publishes a citizen&apos;s exact private location, phone number, or email on the public map.
        </p>
      </div>
      <div className="grid gap-2">
        <Label>Photo (optional)</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setPhoto(String(reader.result));
            reader.readAsDataURL(file);
          }}
        />
      </div>
      <Button type="submit" size="lg">
        Submit report
      </Button>
    </form>
  );
}
