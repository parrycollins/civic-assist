"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AGENCIES } from "@/data/agencies";
import { CategoryCard } from "@/components/ui-kit/CategoryCard";
import { CATEGORY_META } from "@/lib/constants";
import { approximateLocation } from "@/lib/geo";
import { useCivicStore } from "@/lib/store";
import { ReportRankDialog } from "@/components/report/ReportRankDialog";
import type { DispatchResult } from "@/lib/dispatch";
import type { Category, RoadHazard, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = ["Problem", "Evidence", "Location", "Details", "Submit"] as const;

const CHOICES: {
  id: string;
  label: string;
  icon: string;
  category: Category;
  hazard?: RoadHazard;
}[] = [
  { id: "pothole", label: "Pothole", icon: "🕳️", category: "roads", hazard: "pothole" },
  { id: "flooding", label: "Flooding", icon: "🌊", category: "flooding", hazard: "flooding" },
  { id: "waste", label: "Waste", icon: "🗑️", category: "waste" },
  { id: "streetlights", label: "Streetlight", icon: "💡", category: "streetlights", hazard: "traffic_light" },
  { id: "drainage", label: "Drainage", icon: "🚰", category: "drainage" },
  { id: "roads", label: "Road", icon: "🛣️", category: "roads", hazard: "damaged_road" },
  { id: "water", label: "Water", icon: "💧", category: "water" },
  { id: "other", label: "Other", icon: "📍", category: "other" },
];

export function ReportForm({
  preset,
}: {
  preset?: { category?: Category; roadHazard?: string; title?: string };
}) {
  const router = useRouter();
  const user = useCivicStore((s) => s.user);
  const addIssue = useCivicStore((s) => s.addIssue);
  const setRecognition = useCivicStore((s) => s.setRecognition);
  const [step, setStep] = useState(0);
  const [choiceId, setChoiceId] = useState(() => {
    if (preset?.roadHazard) {
      return CHOICES.find((c) => c.hazard === preset.roadHazard)?.id ?? "pothole";
    }
    if (preset?.category) {
      return CHOICES.find((c) => c.category === preset.category)?.id ?? "pothole";
    }
    return "pothole";
  });
  const [title, setTitle] = useState(preset?.title ?? "");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [agencyId, setAgencyId] = useState("dur");
  const [photo, setPhoto] = useState<string | undefined>();
  const [coords, setCoords] = useState({ lat: 5.6037, lng: -0.187 });
  const [locLabel, setLocLabel] = useState("Accra (approximate)");
  const [done, setDone] = useState<DispatchResult | null>(null);

  const choice = CHOICES.find((c) => c.id === choiceId) ?? CHOICES[0];
  const road = useMemo(
    () => ["roads", "flooding"].includes(choice.category) || Boolean(preset?.roadHazard || choice.hazard),
    [choice, preset],
  );

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

  function submit() {
    if (!user) {
      router.push("/login");
      return;
    }
    const finalTitle = title.trim() || `${choice.label} reported in the community`;
    const finalDescription =
      description.trim() || `A ${choice.label.toLowerCase()} problem needs attention. Exact private location is not published.`;
    const result = addIssue({
      title: finalTitle,
      category: choice.category,
      description: finalDescription,
      lat: coords.lat,
      lng: coords.lng,
      imageDataUrl: photo,
      photoKey: `${choice.category}-before`,
      isRoadRelated: road,
      roadHazard: (preset?.roadHazard as RoadHazard | undefined) ?? choice.hazard,
      severity,
      agencyId,
    });
    setDone(result);
  }

  if (done) {
    return (
      <ReportRankDialog
        result={done}
        onClose={() => {
          setDone(null);
          setStep(0);
          setTitle("");
          setDescription("");
          setPhoto(undefined);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 pb-8 md:py-8">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => (step === 0 ? router.push("/") : setStep((s) => s - 1))}
          className="grid size-10 place-items-center rounded-2xl bg-card shadow-sm"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
          Step {step + 1} of {STEPS.length}
        </p>
        <span className="w-10" />
      </div>

      <div className="mb-6 flex gap-1.5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-secondary")} />
          </div>
        ))}
      </div>

      {step === 0 && (
        <section className="animate-civic-in">
          <h1 className="font-heading text-3xl font-extrabold">What&apos;s the problem?</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose the closest category. You can add a photo and location next.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {CHOICES.map((item) => (
              <CategoryCard
                key={item.id}
                icon={item.icon}
                label={item.label}
                selected={choiceId === item.id}
                onClick={() => {
                  setChoiceId(item.id);
                  if (!title) setTitle(`${item.label} in the community`);
                }}
              />
            ))}
          </div>
          <Next onClick={() => setStep(1)} />
        </section>
      )}

      {step === 1 && (
        <section className="animate-civic-in">
          <h1 className="font-heading text-3xl font-extrabold">Add evidence</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A photo helps agencies act faster. Optional, but powerful.
          </p>
          <label className="mt-6 grid min-h-[16rem] cursor-pointer place-items-center overflow-hidden rounded-[1.8rem] bg-card card-lift">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Selected evidence" className="h-64 w-full object-cover" />
            ) : (
              <div className="px-6 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary">
                  <Camera className="size-6 text-primary" />
                </span>
                <p className="mt-3 font-heading font-bold">Upload a photo</p>
                <p className="mt-1 text-sm text-muted-foreground">Tap to choose from your library</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPhoto(String(reader.result));
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <Next label={photo ? "Continue" : "Skip for now"} onClick={() => setStep(2)} />
        </section>
      )}

      {step === 2 && (
        <section className="animate-civic-in">
          <h1 className="font-heading text-3xl font-extrabold">Location</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            CivicGH publishes a street / area pin, never your exact private location. Nearby reports of the same problem (about 300 metres) are counted together.
          </p>
          <div className="card-lift relative mt-6 overflow-hidden rounded-[1.8rem] bg-card">
            <div className="h-48 bg-[radial-gradient(circle_at_30%_40%,rgb(13_79_60/0.18),transparent_42%),linear-gradient(180deg,#d7e3d6,#c5d4c4)]">
              <div className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
                <span className="grid size-12 place-items-center rounded-full bg-primary text-xl text-primary-foreground shadow-lg">
                  {choice.icon}
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="flex items-center gap-2 font-heading font-bold">
                <MapPin className="size-4 text-primary" />
                {locLabel}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)} · approximate
              </p>
              <button
                type="button"
                onClick={useLocation}
                className="mt-3 inline-flex h-11 items-center justify-center rounded-2xl bg-secondary px-4 text-sm font-bold"
              >
                Use approximate GPS
              </button>
            </div>
          </div>
          <Next onClick={() => setStep(3)} />
        </section>
      )}

      {step === 3 && (
        <section className="animate-civic-in space-y-4">
          <h1 className="font-heading text-3xl font-extrabold">Description</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Keep it public-safe. Do not include your address or phone number.
          </p>
          {user?.role === "citizen" && (
            <div className="rounded-[1.3rem] bg-card p-4">
              <p className="text-sm font-semibold">If this is fixed, how should CivicGH credit you?</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className={`h-10 rounded-2xl px-3 text-xs font-bold ${user.recognition === "named" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                  onClick={() => setRecognition("named", user.name)}
                >
                  Show my name
                </button>
                <button
                  type="button"
                  className={`h-10 rounded-2xl px-3 text-xs font-bold ${user.recognition !== "named" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                  onClick={() => setRecognition("anonymous")}
                >
                  Show anonymously
                </button>
              </div>
            </div>
          )}
          <label className="grid gap-1.5 text-sm font-semibold">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${choice.label} on the main road`}
              className="h-12 rounded-2xl border-0 bg-card px-4 text-sm outline-none ring-1 ring-border focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            What is happening?
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Short public description of the problem."
              className="rounded-2xl border-0 bg-card px-4 py-3 text-sm outline-none ring-1 ring-border focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-semibold">
              Severity
              <select
                className="h-12 rounded-2xl bg-card px-3 text-sm"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Agency
              <select
                className="h-12 rounded-2xl bg-card px-3 text-sm"
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
          <Next onClick={() => setStep(4)} />
        </section>
      )}

      {step === 4 && (
        <section className="animate-civic-in">
          <h1 className="font-heading text-3xl font-extrabold">Submit</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            CivicGH stores this in the cloud. The agency is notified only after five nearby reports of the same problem.
          </p>
          <div className="card-lift mt-6 space-y-3 rounded-[1.6rem] bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">
              {choice.icon} {CATEGORY_META[choice.category].label}
            </p>
            <p className="font-heading text-xl font-extrabold">{title || `${choice.label} in the community`}</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {description || "A short community report will be published."}
            </p>
            <p className="text-sm font-semibold">{locLabel}</p>
          </div>
          <button
            type="button"
            onClick={submit}
            className="pressable relative z-10 mt-6 mb-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
          >
            Submit to CivicGH Cloud
          </button>
        </section>
      )}
    </div>
  );
}

function Next({ onClick, label = "Continue" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable relative z-10 mt-6 mb-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
    >
      {label}
    </button>
  );
}
