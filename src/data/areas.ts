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
  { id: "achimota-mall", name: "Achimota Mall", kind: "landmark", center: { lat: 5.613, lng: -0.232 }, aliases: ["achimota mall"] },
  { id: "junction-mall", name: "Junction Mall", kind: "landmark", center: { lat: 5.603, lng: -0.182 }, aliases: ["junction mall", "nungua junction mall"] },
  { id: "marina-mall", name: "Marina Mall", kind: "landmark", center: { lat: 5.606, lng: -0.177 }, aliases: ["marina mall"] },
  { id: "west-hills-mall", name: "West Hills Mall", kind: "landmark", center: { lat: 5.58, lng: -0.32 }, aliases: ["westhills"] },
  { id: "labadi-beach", name: "Labadi Beach", kind: "landmark", center: { lat: 5.56, lng: -0.144 }, aliases: ["labadi", "la beach"] },
  { id: "laboma", name: "Laboma Beach", kind: "landmark", center: { lat: 5.555, lng: -0.152 }, aliases: ["laboma"] },
  { id: "ridge", name: "Ridge", kind: "neighborhood", center: { lat: 5.56, lng: -0.2 }, aliases: ["north ridge", "west ridge"] },
  { id: "roman-ridge", name: "Roman Ridge", kind: "neighborhood", center: { lat: 5.6, lng: -0.19 }, aliases: ["roman ridge"] },
  { id: "abelemkpe", name: "Abelemkpe", kind: "neighborhood", center: { lat: 5.6, lng: -0.21 }, aliases: ["abelemkpe"] },
  { id: "tesano", name: "Tesano", kind: "neighborhood", center: { lat: 5.605, lng: -0.235 }, aliases: ["tesano"] },
  { id: "kwabenya", name: "Kwabenya", kind: "neighborhood", center: { lat: 5.7, lng: -0.22 }, aliases: ["kwabenya", "atomic"] },
  { id: "ashaiman", name: "Ashaiman", kind: "neighborhood", center: { lat: 5.7, lng: -0.04 }, aliases: ["ashaiman"] },
  { id: "sakumono", name: "Sakumono", kind: "neighborhood", center: { lat: 5.62, lng: -0.05 }, aliases: ["sakumono"] },
  { id: "lashibi", name: "Lashibi", kind: "neighborhood", center: { lat: 5.67, lng: -0.03 }, aliases: ["lashibi"] },
  { id: "community-1", name: "Tema Community 1", kind: "neighborhood", center: { lat: 5.64, lng: -0.01 }, aliases: ["community 1", "tema community 1"] },
  { id: "pokuase", name: "Pokuase", kind: "neighborhood", center: { lat: 5.7, lng: -0.28 }, aliases: ["pokuase"] },
  { id: "kasoa", name: "Kasoa", kind: "neighborhood", center: { lat: 5.53, lng: -0.42 }, aliases: ["kasoa"] },
  { id: "mallam", name: "Mallam", kind: "neighborhood", center: { lat: 5.56, lng: -0.3 }, aliases: ["mallam"] },
  { id: "odorkor", name: "Odorkor", kind: "neighborhood", center: { lat: 5.575, lng: -0.28 }, aliases: ["odorkor"] },
  { id: "darkuman", name: "Darkuman", kind: "neighborhood", center: { lat: 5.58, lng: -0.26 }, aliases: ["darkuman"] },
  { id: "mataheko", name: "Mataheko", kind: "neighborhood", center: { lat: 5.55, lng: -0.25 }, aliases: ["mataheko"] },
  { id: "ablekuma", name: "Ablekuma", kind: "neighborhood", center: { lat: 5.545, lng: -0.28 }, aliases: ["ablekuma"] },
  { id: "gbawe", name: "Gbawe", kind: "neighborhood", center: { lat: 5.57, lng: -0.31 }, aliases: ["gbawe"] },
  { id: "bortianor", name: "Bortianor", kind: "neighborhood", center: { lat: 5.53, lng: -0.35 }, aliases: ["bortianor"] },
  { id: "mcCarthy-hill", name: "McCarthy Hill", kind: "neighborhood", center: { lat: 5.555, lng: -0.3 }, aliases: ["mccarthy hill"] },
  { id: "abeka", name: "Abeka", kind: "neighborhood", center: { lat: 5.6, lng: -0.245 }, aliases: ["abeka"] },
  { id: "kwashieman", name: "Kwashieman", kind: "neighborhood", center: { lat: 5.595, lng: -0.27 }, aliases: ["kwashieman"] },
  { id: "taifa", name: "Taifa", kind: "neighborhood", center: { lat: 5.68, lng: -0.24 }, aliases: ["taifa"] },
  { id: "atomic-junction", name: "Atomic Junction", kind: "landmark", center: { lat: 5.675, lng: -0.2 }, aliases: ["atomic junction"] },
  { id: "madina-zongo", name: "Madina Zongo Junction", kind: "landmark", center: { lat: 5.67, lng: -0.17 }, aliases: ["zongo junction"] },
  { id: "37-roundabout", name: "37 Roundabout", kind: "landmark", center: { lat: 5.586, lng: -0.178 }, aliases: ["37"] },
  { id: "tema-station", name: "Tema Station", kind: "landmark", center: { lat: 5.55, lng: -0.21 }, aliases: ["tema station"] },
  { id: "accra-sports", name: "Accra Sports Stadium", kind: "landmark", center: { lat: 5.551, lng: -0.192 }, aliases: ["ohene djan", "sports stadium"] },
  { id: "parliament", name: "Parliament House", kind: "landmark", center: { lat: 5.557, lng: -0.186 }, aliases: ["parliament"] },
  { id: "trade-fair", name: "Accra International Trade Fair", kind: "landmark", center: { lat: 5.568, lng: -0.16 }, aliases: ["trade fair", "labadi trade fair"] },
  { id: "ups-accra", name: "University of Professional Studies", kind: "landmark", center: { lat: 5.66, lng: -0.17 }, aliases: ["upsa"] },
  { id: "giffard-road", name: "Giffard Road", kind: "street", center: { lat: 5.59, lng: -0.1 }, aliases: ["giffard road"] },
  { id: "winneba-road", name: "Winneba Road", kind: "street", center: { lat: 5.59, lng: -0.26 }, aliases: ["winneba road"] },
  { id: "nima-highway", name: "Nima Highway", kind: "street", center: { lat: 5.586, lng: -0.196 }, aliases: ["nima highway"] },
  { id: "graphic-road", name: "Graphic Road", kind: "street", center: { lat: 5.545, lng: -0.22 }, aliases: ["graphic road"] },
  { id: "high-street", name: "High Street Accra", kind: "street", center: { lat: 5.543, lng: -0.207 }, aliases: ["high street"] },
  { id: "independence-ave", name: "Independence Avenue", kind: "street", center: { lat: 5.57, lng: -0.19 }, aliases: ["independence avenue"] },
  { id: "coca-cola-roundabout", name: "Coca-Cola Roundabout", kind: "landmark", center: { lat: 5.63, lng: -0.1 }, aliases: ["coca cola roundabout"] },
  { id: "awoshie", name: "Awoshie", kind: "neighborhood", center: { lat: 5.6, lng: -0.29 }, aliases: ["awoshie"] },
  { id: "sowutuom", name: "Sowutuom", kind: "neighborhood", center: { lat: 5.62, lng: -0.29 }, aliases: ["sowutuom"] },
  { id: "adjiriganor", name: "Adjiringanor", kind: "neighborhood", center: { lat: 5.64, lng: -0.13 }, aliases: ["adjiriganor", "adjiringanor"] },
  { id: "trasacco", name: "Trasacco Valley", kind: "neighborhood", center: { lat: 5.64, lng: -0.14 }, aliases: ["trasacco"] },
  { id: "east-legon-hills", name: "East Legon Hills", kind: "neighborhood", center: { lat: 5.66, lng: -0.13 }, aliases: ["east legon hills"] },
  { id: "agbogba", name: "Agbogba", kind: "neighborhood", center: { lat: 5.68, lng: -0.19 }, aliases: ["agbogba"] },
  { id: "pantang", name: "Pantang", kind: "neighborhood", center: { lat: 5.72, lng: -0.18 }, aliases: ["pantang"] },
  { id: "adenta-barrier", name: "Adenta Barrier", kind: "landmark", center: { lat: 5.705, lng: -0.16 }, aliases: ["adenta barrier"] },
  { id: "ashongman", name: "Ashongman", kind: "neighborhood", center: { lat: 5.7, lng: -0.21 }, aliases: ["ashongman"] },
  { id: "dome-pillar-2", name: "Dome Pillar Two", kind: "neighborhood", center: { lat: 5.66, lng: -0.235 }, aliases: ["pillar 2"] },
  { id: "north-kaneshie", name: "North Kaneshie", kind: "neighborhood", center: { lat: 5.58, lng: -0.245 }, aliases: ["north kaneshie"] },
  { id: "russian-bungalows", name: "Russian Bungalows", kind: "neighborhood", center: { lat: 5.62, lng: -0.16 }, aliases: ["russian bungalows"] },
  { id: "cantonments-road", name: "Cantonments Road", kind: "street", center: { lat: 5.575, lng: -0.175 }, aliases: ["cantonments road"] },
  { id: "makola", name: "Makola Market", kind: "landmark", center: { lat: 5.548, lng: -0.207 }, aliases: ["makola"] },
  { id: "nkrumah-park", name: "Kwame Nkrumah Memorial Park", kind: "landmark", center: { lat: 5.545, lng: -0.206 }, aliases: ["nkrumah mausoleum", "kwame nkrumah memorial"] },
  { id: "ac-mall", name: "A&C Mall", kind: "landmark", center: { lat: 5.636, lng: -0.154 }, aliases: ["a and c mall", "a&c"] },
  { id: "okaishie", name: "Okaishie", kind: "neighborhood", center: { lat: 5.55, lng: -0.21 }, aliases: ["okaishie"] },
  { id: "agbogbloshie", name: "Agbogbloshie", kind: "neighborhood", center: { lat: 5.548, lng: -0.223 }, aliases: ["agbogbloshie"] },
];

export function findPlaces(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return PLACES.map((place) => {
    const name = place.name.toLowerCase();
    const aliases = place.aliases.map((alias) => alias.toLowerCase());
    let score = 0;
    if (name === q || aliases.includes(q)) score = 100;
    else if (name.startsWith(q) || aliases.some((alias) => alias.startsWith(q))) score = 80;
    else if (name.includes(q) || aliases.some((alias) => alias.includes(q))) score = 50;
    return { place, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.place);
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
