import { NextResponse } from "next/server";
import { inGreaterAccra } from "@/lib/accra";

function parsePoint(value: string | null) {
  if (!value) return null;
  const [lng, lat] = value.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const from = parsePoint(params.get("from"));
  const to = parsePoint(params.get("to"));
  const via = params.getAll("via").map(parsePoint).filter(Boolean) as { lat: number; lng: number }[];
  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required as lng,lat" }, { status: 400 });
  }
  if (!inGreaterAccra(from) || !inGreaterAccra(to)) {
    return NextResponse.json({ error: "Road Assist only plans trips inside Greater Accra." }, { status: 400 });
  }

  const coords = [from, ...via, to].map((p) => `${p.lng},${p.lat}`).join(";");
  const alternatives = via.length ? "false" : "true";
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline&alternatives=${alternatives}&steps=false&continue_straight=false`;
  const res = await fetch(url, {
    headers: { "User-Agent": "CivicGH/1.0" },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Routing provider unavailable" }, { status: 502 });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
