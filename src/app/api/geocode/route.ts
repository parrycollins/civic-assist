import { NextResponse } from "next/server";
import { GREATER_ACCRA, NOMINATIM_VIEWBOX, inGreaterAccra } from "@/lib/accra";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const biased = /accra|tema|kasoa|madina|legon|spintex|kaneshie/i.test(q) ? q : `${q} Accra`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", biased);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "8");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("countrycodes", "gh");
  url.searchParams.set("viewbox", NOMINATIM_VIEWBOX);
  url.searchParams.set("bounded", "1");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      "User-Agent": "CivicGH/1.0 (civic accountability map for Greater Accra)",
    },
    next: { revalidate: 120 },
  });
  if (!res.ok) return NextResponse.json({ hits: [] }, { status: 200 });
  const data = (await res.json()) as { display_name: string; lat: string; lon: string }[];
  const hits = data
    .map((item) => ({
      label: item.display_name.split(",").slice(0, 3).join(",").trim(),
      lat: Number(item.lat),
      lng: Number(item.lon),
      source: "nominatim" as const,
    }))
    .filter((hit) => Number.isFinite(hit.lat) && Number.isFinite(hit.lng) && inGreaterAccra(hit));

  return NextResponse.json({
    hits,
    bounds: GREATER_ACCRA,
  });
}
