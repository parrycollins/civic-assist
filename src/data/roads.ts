import type { RoadSegment } from "@/lib/types";

export const ROAD_SEGMENTS: RoadSegment[] = [
  {
    id: "n1-tema",
    name: "N1 Tema Motorway — Tetteh Quarshie to Tema",
    municipality: "Greater Accra",
    area: "Spintex",
    polyline: [
      [5.636, -0.175],
      [5.638, -0.12],
      [5.645, -0.07],
      [5.66, -0.03],
      [5.67, -0.016],
    ],
    history: [
      { id: "h1", month: "January 2026", label: "3 pothole reports", detail: "Citizens reported carriageway potholes near the Spintex interchange." },
      { id: "h2", month: "March 2026", label: "8 pothole reports", detail: "Reports clustered after heavy rains. Confidence rose to high." },
      { id: "h3", month: "May 2026", label: "Road repair started", detail: "Department of Urban Roads began patching the eastbound lanes." },
      { id: "h4", month: "June 2026", label: "Repair completed", detail: "Resurfacing completed. Citizens verified the work." },
      { id: "h5", month: "July 2026", label: "2 new pothole reports", detail: "Two new reports after a storm. Still under review." },
    ],
  },
  {
    id: "spintex-rd",
    name: "Spintex Road",
    municipality: "Ledzokuku",
    area: "Spintex",
    polyline: [
      [5.636, -0.175],
      [5.638, -0.13],
      [5.64, -0.09],
      [5.642, -0.06],
    ],
    history: [
      { id: "s1", month: "February 2026", label: "Flooding after rainfall", detail: "Standing water near the Coca-Cola roundabout." },
      { id: "s2", month: "August 2026", label: "Drain desilting", detail: "Municipal crews cleared blocked drains." },
    ],
  },
  {
    id: "liberation",
    name: "Liberation Road",
    municipality: "Accra Central",
    area: "Airport Residential",
    polyline: [
      [5.56, -0.192],
      [5.58, -0.185],
      [5.6, -0.18],
      [5.62, -0.176],
    ],
    history: [
      { id: "l1", month: "April 2026", label: "Broken traffic signal", detail: "37 Hospital junction signal failed during peak hours." },
      { id: "l2", month: "April 2026", label: "Signal repaired", detail: "ECG and Urban Roads restored the signal the next day." },
    ],
  },
  {
    id: "ring-road-c",
    name: "Ring Road Central",
    municipality: "Accra Central",
    area: "Circle",
    polyline: [
      [5.56, -0.22],
      [5.56, -0.205],
      [5.562, -0.19],
      [5.57, -0.18],
    ],
    history: [
      { id: "r1", month: "August 2026", label: "Construction and lane closures", detail: "Utility works reduced Circle to one lane each way." },
    ],
  },
  {
    id: "east-legon-ave",
    name: "East Legon Avenue",
    municipality: "Ayawaso West",
    area: "East Legon",
    polyline: [
      [5.63, -0.165],
      [5.636, -0.159],
      [5.642, -0.152],
      [5.648, -0.146],
    ],
    history: [
      { id: "e1", month: "August 2026", label: "Blocked drain", detail: "Flooding of the carriageway after a blocked roadside drain." },
      { id: "e2", month: "September 2026", label: "Drain cleared and verified", detail: "Municipal Authority cleared the drain. Citizens verified the work." },
    ],
  },
  {
    id: "dansoman-high",
    name: "Dansoman High Street",
    municipality: "Ablekuma West",
    area: "Dansoman",
    polyline: [
      [5.545, -0.28],
      [5.54, -0.27],
      [5.536, -0.26],
    ],
    history: [
      { id: "d1", month: "July 2026", label: "Waste backlog", detail: "Skipped collections after a truck breakdown." },
    ],
  },
  {
    id: "achimota-ofankor",
    name: "Achimota–Ofankor Road",
    municipality: "Ga West",
    area: "Ofankor",
    polyline: [
      [5.62, -0.23],
      [5.65, -0.25],
      [5.68, -0.27],
    ],
    history: [
      { id: "a1", month: "June 2026", label: "Carriageway damage", detail: "Heavy trucks worsened the northbound lane." },
      { id: "a2", month: "August 2026", label: "Patching in progress", detail: "Ghana Highway Authority started repairs." },
    ],
  },
  {
    id: "osu-oxford",
    name: "Oxford Street, Osu",
    municipality: "Accra Central",
    area: "Osu",
    polyline: [
      [5.553, -0.178],
      [5.556, -0.174],
      [5.559, -0.17],
    ],
    history: [
      { id: "o1", month: "August 2026", label: "Broken streetlight", detail: "Dark stretch near the Oxford Street junction." },
    ],
  },
];

export function getRoadSegment(id: string) {
  return ROAD_SEGMENTS.find((r) => r.id === id);
}
