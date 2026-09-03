import type { Area, Place } from "@/lib/types";

export const AREAS: Area[] = [
  { id: "east-legon", name: "East Legon", municipality: "Ayawaso West", center: { lat: 5.6364, lng: -0.1588 }, aliases: ["east legon", "eastlegon"] },
  { id: "osu", name: "Osu", municipality: "Accra Central", center: { lat: 5.555, lng: -0.175 }, aliases: ["osu", "oxford street"] },
  { id: "labone", name: "Labone", municipality: "La Dade Kotopon", center: { lat: 5.56, lng: -0.165 }, aliases: ["labone"] },
  { id: "cantonments", name: "Cantonments", municipality: "La Dade Kotopon", center: { lat: 5.582, lng: -0.173 }, aliases: ["cantonments"] },
  { id: "airport", name: "Airport Residential", municipality: "La Dade Kotopon", center: { lat: 5.605, lng: -0.175 }, aliases: ["airport residential", "airport"] },
  { id: "dzorwulu", name: "Dzorwulu", municipality: "Ayawaso West", center: { lat: 5.612, lng: -0.198 }, aliases: ["dzorwulu"] },
  { id: "madina", name: "Madina", municipality: "Ga East", center: { lat: 5.6833, lng: -0.1667 }, aliases: ["madina"] },
  { id: "adenta", name: "Adenta", municipality: "Adenta", center: { lat: 5.708, lng: -0.156 }, aliases: ["adenta"] },
  { id: "legon", name: "Legon", municipality: "Ga East", center: { lat: 5.65, lng: -0.187 }, aliases: ["legon", "university of ghana"] },
  { id: "haatso", name: "Haatso", municipality: "Ga East", center: { lat: 5.668, lng: -0.195 }, aliases: ["haatso"] },
  { id: "spintex", name: "Spintex", municipality: "Ledzokuku", center: { lat: 5.64, lng: -0.08 }, aliases: ["spintex", "spintex road"] },
  { id: "teshie", name: "Teshie", municipality: "Ledzokuku", center: { lat: 5.583, lng: -0.107 }, aliases: ["teshie"] },
  { id: "nungua", name: "Nungua", municipality: "Ledzokuku", center: { lat: 5.601, lng: -0.077 }, aliases: ["nungua"] },
  { id: "tema", name: "Tema", municipality: "Tema", center: { lat: 5.6698, lng: -0.0166 }, aliases: ["tema"] },
  { id: "kaneshie", name: "Kaneshie", municipality: "Accra Central", center: { lat: 5.57, lng: -0.24 }, aliases: ["kaneshie"] },
  { id: "dansoman", name: "Dansoman", municipality: "Ablekuma West", center: { lat: 5.54, lng: -0.27 }, aliases: ["dansoman"] },
  { id: "nima", name: "Nima", municipality: "Ayawaso East", center: { lat: 5.585, lng: -0.195 }, aliases: ["nima"] },
  { id: "achimota", name: "Achimota", municipality: "Okaikwei North", center: { lat: 5.62, lng: -0.23 }, aliases: ["achimota"] },
  { id: "circle", name: "Kwame Nkrumah Circle", municipality: "Accra Central", center: { lat: 5.56, lng: -0.205 }, aliases: ["circle", "kwame nkrumah circle"] },
  { id: "accra-central", name: "Accra Central", municipality: "Accra Central", center: { lat: 5.55, lng: -0.2 }, aliases: ["accra", "accra central", "jamestown"] },
  { id: "korle-bu", name: "Korle Bu", municipality: "Accra Central", center: { lat: 5.535, lng: -0.225 }, aliases: ["korle bu"] },
  { id: "adabraka", name: "Adabraka", municipality: "Accra Central", center: { lat: 5.56, lng: -0.21 }, aliases: ["adabraka"] },
  { id: "lapaz", name: "Lapaz", municipality: "Ga West", center: { lat: 5.607, lng: -0.25 }, aliases: ["lapaz"] },
  { id: "ofankor", name: "Ofankor", municipality: "Ga West", center: { lat: 5.68, lng: -0.27 }, aliases: ["ofankor"] },
  { id: "shiashie", name: "Shiashie", municipality: "Ayawaso West", center: { lat: 5.628, lng: -0.145 }, aliases: ["shiashie"] },
  { id: "airport-city", name: "Airport City", municipality: "Ayawaso West", center: { lat: 5.605, lng: -0.177 }, aliases: ["airport city"] },
  { id: "weija", name: "Weija", municipality: "Weija Gbawe", center: { lat: 5.57, lng: -0.337 }, aliases: ["weija"] },
  { id: "dome", name: "Dome", municipality: "Ga East", center: { lat: 5.655, lng: -0.232 }, aliases: ["dome"] },
];

export const PLACES: Place[] = [
  ...AREAS.map((a) => ({
    id: a.id,
    name: a.name,
    kind: "neighborhood" as const,
    center: a.center,
    aliases: a.aliases,
  })),
  { id: "kotoka", name: "Kotoka International Airport", kind: "landmark", center: { lat: 5.6052, lng: -0.1668 }, aliases: ["airport", "kotoka", "accra airport"] },
  { id: "accra-mall", name: "Accra Mall", kind: "landmark", center: { lat: 5.622, lng: -0.173 }, aliases: ["accra mall"] },
  { id: "west-hills", name: "West Hills Mall", kind: "landmark", center: { lat: 5.58, lng: -0.32 }, aliases: ["west hills"] },
  { id: "ug", name: "University of Ghana", kind: "landmark", center: { lat: 5.6506, lng: -0.187 }, aliases: ["legon campus", "university of ghana"] },
  { id: "korle-bu-hospital", name: "Korle Bu Teaching Hospital", kind: "landmark", center: { lat: 5.537, lng: -0.226 }, aliases: ["korle bu hospital"] },
  { id: "independence-square", name: "Independence Square", kind: "landmark", center: { lat: 5.548, lng: -0.192 }, aliases: ["black star square"] },
  { id: "37", name: "37 Military Hospital", kind: "landmark", center: { lat: 5.585, lng: -0.18 }, aliases: ["37 hospital"] },
  { id: "madina-market", name: "Madina Market", kind: "landmark", center: { lat: 5.677, lng: -0.164 }, aliases: ["madina market"] },
  { id: "kaneshie-market", name: "Kaneshie Market", kind: "landmark", center: { lat: 5.568, lng: -0.243 }, aliases: ["kaneshie market"] },
  { id: "tetteh-quarshie", name: "Tetteh Quarshie Interchange", kind: "landmark", center: { lat: 5.636, lng: -0.175 }, aliases: ["tetteh quarshie"] },
  { id: "spintex-road", name: "Spintex Road", kind: "street", center: { lat: 5.638, lng: -0.09 }, aliases: ["spintex road"] },
  { id: "liberation-rd", name: "Liberation Road", kind: "street", center: { lat: 5.595, lng: -0.182 }, aliases: ["liberation road"] },
  { id: "n1", name: "N1 Tema Motorway", kind: "street", center: { lat: 5.64, lng: -0.08 }, aliases: ["n1", "tema motorway"] },
  { id: "ring-road", name: "Ring Road", kind: "street", center: { lat: 5.57, lng: -0.2 }, aliases: ["ring road"] },
  { id: "oxford-street", name: "Oxford Street", kind: "street", center: { lat: 5.556, lng: -0.174 }, aliases: ["oxford street", "osu oxford"] },
];

export function findPlaces(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.aliases.some((a) => a.includes(q)),
  );
}

export function getAreaById(id: string) {
  return AREAS.find((a) => a.id === id);
}

export function areaForPoint(lat: number, lng: number) {
  let best = AREAS[0];
  let bestD = Infinity;
  for (const area of AREAS) {
    const d =
      (area.center.lat - lat) ** 2 + (area.center.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = area;
    }
  }
  return best;
}
