import { AREAS } from "./areas";
import type {
  Category,
  Evidence,
  Issue,
  IssueLocation,
  IssueStatus,
  RoadHazard,
  Severity,
  TimelineEvent,
} from "@/lib/types";

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = rng(20260903);

function pick<T>(items: T[]) {
  return items[Math.floor(rand() * items.length)];
}

function iso(year: number, month: number, day: number, hour = 10) {
  return new Date(Date.UTC(year, month - 1, day, hour, 0, 0)).toISOString();
}

function loc(
  areaId: string,
  street: string,
  jitter = 0.008,
): IssueLocation {
  const area = AREAS.find((a) => a.id === areaId) ?? AREAS[0];
  const lat = area.center.lat + (rand() - 0.5) * jitter;
  const lng = area.center.lng + (rand() - 0.5) * jitter;
  return {
    lat,
    lng,
    area: area.name,
    street,
    municipality: area.municipality,
    publicLabel: street ? `${street}, ${area.name}` : area.name,
  };
}

function evidence(
  complaintId: string,
  stage: Evidence["stage"],
  photoKey: string,
  timestamp: string,
  uploadedBy: string,
  agencyId?: string,
  description?: string,
): Evidence {
  return {
    id: `${complaintId}-${stage}-${photoKey}`,
    complaintId,
    stage,
    photoKey,
    timestamp,
    uploadedBy,
    uploadedByRole: agencyId ? "agency" : "citizen",
    agencyId,
    description,
  };
}

function event(
  id: string,
  status: TimelineEvent["status"],
  label: string,
  timestamp: string,
  actor: string,
  actorRole: TimelineEvent["actorRole"] = "system",
  note?: string,
): TimelineEvent {
  return { id, status, label, timestamp, actor, actorRole, note };
}

function featuredIssues(): Issue[] {
  const drain: Issue = {
    id: "CGH-2026-0001",
    title: "Blocked Drain",
    category: "drainage",
    description:
      "The roadside drain on East Legon Avenue is fully silted. Stormwater spills onto the carriageway after even short rains, flooding shops and the pedestrian crossing.",
    photoKey: "drain-before",
    location: {
      lat: 5.6362,
      lng: -0.1589,
      area: "East Legon",
      street: "East Legon Avenue",
      municipality: "Ayawaso West",
      publicLabel: "East Legon Avenue, East Legon",
    },
    reportedAt: iso(2026, 8, 28, 8),
    agencyId: "ayawaso",
    status: "verified",
    reporterCount: 14,
    affectedCount: 14,
    lastUpdateAt: iso(2026, 9, 2, 16),
    isRoadRelated: true,
    roadHazard: "flooding",
    severity: "high",
    supportingReports: 14,
    denials: 0,
    confidence: 0.94,
    roadSegmentId: "east-legon-ave",
    verificationCount: 12,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("t1", "reported", "Reported", iso(2026, 8, 28, 8), "14 citizens", "citizen"),
      event("t2", "assigned", "Assigned", iso(2026, 8, 28, 15), "Ayawaso West Municipal Assembly", "agency"),
      event("t3", "agency_accepted", "Agency accepted", iso(2026, 8, 29, 9), "Municipal Works", "agency"),
      event("t4", "work_started", "Work started", iso(2026, 8, 30, 7), "Municipal Works", "agency"),
      event("t5", "resolved", "Resolved", iso(2026, 9, 1, 17), "Municipal Authority", "agency"),
      event("t6", "citizen_verified", "Citizen verified", iso(2026, 9, 2, 16), "12 of 14 reporters", "citizen"),
    ],
    evidence: [
      evidence("CGH-2026-0001", "before", "drain-before", iso(2026, 8, 28, 8), "Citizen reports", undefined, "Original blocked drain at the roadside."),
      evidence("CGH-2026-0001", "during", "drain-during", iso(2026, 8, 30, 10), "Municipal Works", "ayawaso", "Crew desilting the drain."),
      evidence("CGH-2026-0001", "after", "drain-after", iso(2026, 9, 1, 17), "Municipal Authority", "ayawaso", "Drain cleared and flow restored."),
    ],
  };

  const pothole: Issue = {
    id: "CGH-2026-0002",
    title: "Deep pothole on N1 eastbound",
    category: "roads",
    description:
      "A wide pothole on the Tema Motorway eastbound lanes near Spintex is catching vehicles. Several drivers have confirmed the same location.",
    photoKey: "pothole-before",
    location: {
      lat: 5.641,
      lng: -0.092,
      area: "Spintex",
      street: "N1 Tema Motorway",
      municipality: "Ledzokuku",
      publicLabel: "N1 Tema Motorway, Spintex",
    },
    reportedAt: iso(2026, 8, 26, 7),
    agencyId: "dur",
    status: "in_progress",
    reporterCount: 9,
    lastUpdateAt: iso(2026, 8, 29, 11),
    isRoadRelated: true,
    roadHazard: "pothole",
    severity: "high",
    supportingReports: 9,
    denials: 0,
    confidence: 0.86,
    roadSegmentId: "n1-tema",
    dueAt: iso(2026, 9, 5, 18),
    verificationCount: 0,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("p1", "reported", "Reported", iso(2026, 8, 26, 7), "9 citizens", "citizen"),
      event("p2", "under_review", "Under review", iso(2026, 8, 26, 14), "Department of Urban Roads", "agency"),
      event("p3", "assigned", "Assigned", iso(2026, 8, 27, 9), "Department of Urban Roads", "agency"),
      event("p4", "agency_accepted", "Agency accepted", iso(2026, 8, 28, 8), "DUR Spintex crew", "agency"),
      event("p5", "work_started", "Work started", iso(2026, 8, 29, 11), "DUR Spintex crew", "agency"),
    ],
    evidence: [
      evidence("CGH-2026-0002", "before", "pothole-before", iso(2026, 8, 26, 7), "Citizen reports"),
      evidence("CGH-2026-0002", "during", "pothole-during", iso(2026, 8, 29, 11), "DUR Spintex crew", "dur", "Patching of the eastbound lane."),
    ],
  };

  const flood: Issue = {
    id: "CGH-2026-0003",
    title: "Flooded carriageway after rainfall",
    category: "flooding",
    description:
      "Standing water covers the inner lane on Spintex Road near the Coca-Cola roundabout whenever it rains. The report was reconfirmed this week.",
    photoKey: "flood-before",
    location: {
      lat: 5.639,
      lng: -0.108,
      area: "Spintex",
      street: "Spintex Road",
      municipality: "Ledzokuku",
      publicLabel: "Spintex Road, Spintex",
    },
    reportedAt: iso(2026, 9, 1, 18),
    agencyId: "nadmo",
    status: "assigned",
    reporterCount: 7,
    lastUpdateAt: iso(2026, 9, 2, 9),
    isRoadRelated: true,
    roadHazard: "flooding",
    severity: "critical",
    supportingReports: 7,
    denials: 0,
    confidence: 0.8,
    roadSegmentId: "spintex-rd",
    dueAt: iso(2026, 9, 4, 18),
    verificationCount: 0,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("f1", "reported", "Reported", iso(2026, 9, 1, 18), "7 citizens", "citizen"),
      event("f2", "under_review", "Under review", iso(2026, 9, 2, 7), "NADMO", "agency"),
      event("f3", "assigned", "Assigned", iso(2026, 9, 2, 9), "Ledzokuku Municipal Assembly", "agency"),
    ],
    evidence: [
      evidence("CGH-2026-0003", "before", "flood-before", iso(2026, 9, 1, 18), "Citizen reports"),
    ],
  };

  const light: Issue = {
    id: "CGH-2026-0004",
    title: "Streetlight out on Oxford Street",
    category: "streetlights",
    description:
      "The pole at the Oxford Street / Cantonments Road junction has been dark for several nights, leaving the pedestrian crossing poorly lit.",
    photoKey: "light-before",
    location: {
      lat: 5.5564,
      lng: -0.1742,
      area: "Osu",
      street: "Oxford Street",
      municipality: "Accra Central",
      publicLabel: "Oxford Street, Osu",
    },
    reportedAt: iso(2026, 8, 31, 20),
    agencyId: "ecg",
    status: "under_review",
    reporterCount: 4,
    lastUpdateAt: iso(2026, 9, 1, 9),
    isRoadRelated: true,
    roadHazard: "traffic_light",
    severity: "medium",
    supportingReports: 4,
    denials: 0,
    confidence: 0.55,
    roadSegmentId: "osu-oxford",
    verificationCount: 0,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("l1", "reported", "Reported", iso(2026, 8, 31, 20), "4 citizens", "citizen"),
      event("l2", "under_review", "Under review", iso(2026, 9, 1, 9), "Electricity Company of Ghana", "agency"),
    ],
    evidence: [evidence("CGH-2026-0004", "before", "light-before", iso(2026, 8, 31, 20), "Citizen reports")],
  };

  const waste: Issue = {
    id: "CGH-2026-0005",
    title: "Uncollected waste at Dansoman High Street",
    category: "waste",
    description:
      "Skip containers have overflowed for four days. The pile is spreading onto the walkway beside the market.",
    photoKey: "waste-before",
    location: {
      lat: 5.541,
      lng: -0.268,
      area: "Dansoman",
      street: "Dansoman High Street",
      municipality: "Ablekuma West",
      publicLabel: "Dansoman High Street, Dansoman",
    },
    reportedAt: iso(2026, 8, 30, 11),
    agencyId: "zoomlion",
    status: "resolved",
    reporterCount: 11,
    lastUpdateAt: iso(2026, 9, 2, 14),
    isRoadRelated: false,
    severity: "medium",
    supportingReports: 11,
    denials: 1,
    confidence: 0.7,
    roadSegmentId: "dansoman-high",
    verificationCount: 6,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("w1", "reported", "Reported", iso(2026, 8, 30, 11), "11 citizens", "citizen"),
      event("w2", "assigned", "Assigned", iso(2026, 8, 30, 16), "Zoomlion Ghana", "agency"),
      event("w3", "in_progress", "Work started", iso(2026, 9, 1, 8), "Zoomlion crew", "agency"),
      event("w4", "resolved", "Resolved", iso(2026, 9, 2, 14), "Zoomlion Ghana", "agency", "Waste removed. Skip replaced."),
    ],
    evidence: [
      evidence("CGH-2026-0005", "before", "waste-before", iso(2026, 8, 30, 11), "Citizen reports"),
      evidence("CGH-2026-0005", "during", "waste-during", iso(2026, 9, 1, 8), "Zoomlion crew", "zoomlion"),
      evidence("CGH-2026-0005", "after", "waste-after", iso(2026, 9, 2, 14), "Zoomlion Ghana", "zoomlion", "Street cleared."),
    ],
  };

  const water: Issue = {
    id: "CGH-2026-0006",
    title: "Burst water main on Liberation Road",
    category: "water",
    description:
      "A burst pipe is flooding the verge near 37 Military Hospital and cutting supply to nearby offices.",
    photoKey: "water-before",
    location: {
      lat: 5.586,
      lng: -0.181,
      area: "Airport Residential",
      street: "Liberation Road",
      municipality: "La Dade Kotopon",
      publicLabel: "Liberation Road near 37 Hospital",
    },
    reportedAt: iso(2026, 9, 3, 6),
    agencyId: "gwcl",
    status: "reported",
    reporterCount: 5,
    lastUpdateAt: iso(2026, 9, 3, 6),
    isRoadRelated: true,
    roadHazard: "obstruction",
    severity: "high",
    supportingReports: 5,
    denials: 0,
    confidence: 0.62,
    roadSegmentId: "liberation",
    verificationCount: 0,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("u1", "reported", "Reported", iso(2026, 9, 3, 6), "5 citizens", "citizen"),
    ],
    evidence: [evidence("CGH-2026-0006", "before", "water-before", iso(2026, 9, 3, 6), "Citizen reports")],
  };

  const closure: Issue = {
    id: "CGH-2026-0007",
    title: "Lane closure at Kwame Nkrumah Circle",
    category: "roads",
    description:
      "Utility trenching has closed the inner lane at Circle. Traffic is being diverted onto the outer ring. Work is overdue against the published finish date.",
    photoKey: "construction-before",
    location: {
      lat: 5.5604,
      lng: -0.2052,
      area: "Kwame Nkrumah Circle",
      street: "Ring Road Central",
      municipality: "Accra Central",
      publicLabel: "Ring Road Central, Circle",
    },
    reportedAt: iso(2026, 8, 20, 9),
    agencyId: "ama",
    status: "in_progress",
    reporterCount: 18,
    lastUpdateAt: iso(2026, 9, 1, 12),
    isRoadRelated: true,
    roadHazard: "construction",
    severity: "high",
    supportingReports: 18,
    denials: 0,
    confidence: 0.9,
    roadSegmentId: "ring-road-c",
    dueAt: iso(2026, 8, 30, 18),
    verificationCount: 0,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("c1", "reported", "Reported", iso(2026, 8, 20, 9), "18 citizens", "citizen"),
      event("c2", "assigned", "Assigned", iso(2026, 8, 20, 14), "Accra Metropolitan Assembly", "agency"),
      event("c3", "in_progress", "Work started", iso(2026, 8, 21, 7), "AMA Works", "agency"),
    ],
    evidence: [
      evidence("CGH-2026-0007", "before", "construction-before", iso(2026, 8, 20, 9), "Citizen reports"),
      evidence("CGH-2026-0007", "during", "construction-during", iso(2026, 8, 25, 10), "AMA Works", "ama"),
    ],
  };

  const disputed: Issue = {
    id: "CGH-2026-0008",
    title: "Pothole reported repaired, then reopened",
    category: "roads",
    description:
      "Urban Roads marked this pothole on Achimota–Ofankor Road as resolved. Three drivers have since said the patch failed after the last rain.",
    photoKey: "pothole-before",
    location: {
      lat: 5.652,
      lng: -0.252,
      area: "Ofankor",
      street: "Achimota–Ofankor Road",
      municipality: "Ga West",
      publicLabel: "Achimota–Ofankor Road",
    },
    reportedAt: iso(2026, 8, 12, 8),
    agencyId: "gha",
    status: "disputed",
    reporterCount: 8,
    lastUpdateAt: iso(2026, 9, 2, 19),
    isRoadRelated: true,
    roadHazard: "pothole",
    severity: "medium",
    supportingReports: 8,
    denials: 3,
    confidence: 0.48,
    roadSegmentId: "achimota-ofankor",
    verificationCount: 0,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("d1", "reported", "Reported", iso(2026, 8, 12, 8), "8 citizens", "citizen"),
      event("d2", "in_progress", "Work started", iso(2026, 8, 18, 9), "Ghana Highway Authority", "agency"),
      event("d3", "resolved", "Resolved", iso(2026, 8, 22, 16), "Ghana Highway Authority", "agency"),
      event("d4", "reopened", "Disputed / reopened", iso(2026, 9, 2, 19), "3 citizens", "citizen", "Patch failed after rainfall."),
    ],
    evidence: [
      evidence("CGH-2026-0008", "before", "pothole-before", iso(2026, 8, 12, 8), "Citizen reports"),
      evidence("CGH-2026-0008", "during", "pothole-during", iso(2026, 8, 18, 9), "GHA crew", "gha"),
      evidence("CGH-2026-0008", "after", "pothole-after", iso(2026, 8, 22, 16), "Ghana Highway Authority", "gha", "Initial patch. Later disputed."),
    ],
  };

  const repaired: Issue = {
    id: "CGH-2026-0009",
    title: "Streetlight repaired on Liberation Road",
    category: "streetlights",
    description:
      "The signal and streetlight at the 37 Hospital junction were restored. Citizens confirmed the night lighting is back.",
    photoKey: "light-after",
    location: {
      lat: 5.5848,
      lng: -0.1804,
      area: "Airport Residential",
      street: "Liberation Road",
      municipality: "La Dade Kotopon",
      publicLabel: "Liberation Road, 37 Hospital junction",
    },
    reportedAt: iso(2026, 8, 18, 21),
    agencyId: "ecg",
    status: "verified",
    reporterCount: 6,
    lastUpdateAt: iso(2026, 8, 21, 20),
    isRoadRelated: true,
    roadHazard: "traffic_light",
    severity: "medium",
    supportingReports: 6,
    denials: 0,
    confidence: 0.88,
    roadSegmentId: "liberation",
    verificationCount: 5,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("r1", "reported", "Reported", iso(2026, 8, 18, 21), "6 citizens", "citizen"),
      event("r2", "assigned", "Assigned", iso(2026, 8, 19, 8), "ECG", "agency"),
      event("r3", "in_progress", "Work started", iso(2026, 8, 19, 14), "ECG", "agency"),
      event("r4", "resolved", "Resolved", iso(2026, 8, 20, 18), "ECG", "agency"),
      event("r5", "citizen_verified", "Citizen verified", iso(2026, 8, 21, 20), "5 of 6 reporters", "citizen"),
    ],
    evidence: [
      evidence("CGH-2026-0009", "before", "light-before", iso(2026, 8, 18, 21), "Citizen reports"),
      evidence("CGH-2026-0009", "during", "light-during", iso(2026, 8, 19, 14), "ECG", "ecg"),
      evidence("CGH-2026-0009", "after", "light-after", iso(2026, 8, 20, 18), "ECG", "ecg"),
    ],
  };

  const nimaDrain: Issue = {
    id: "CGH-2026-0010",
    title: "Collapsed drain wall in Nima",
    category: "drainage",
    description:
      "A section of the Nima drain wall has collapsed, dumping debris into the channel and backing water toward nearby shops.",
    photoKey: "drain-before",
    location: {
      lat: 5.586,
      lng: -0.196,
      area: "Nima",
      street: "Nima Highway",
      municipality: "Ayawaso East",
      publicLabel: "Nima Highway, Nima",
    },
    reportedAt: iso(2026, 8, 25, 12),
    agencyId: "ama",
    status: "assigned",
    reporterCount: 16,
    lastUpdateAt: iso(2026, 8, 27, 10),
    isRoadRelated: false,
    severity: "critical",
    supportingReports: 16,
    denials: 0,
    confidence: 0.84,
    dueAt: iso(2026, 9, 2, 18),
    verificationCount: 0,
    privacyOffset: { lat: 0, lng: 0 },
    timeline: [
      event("n1", "reported", "Reported", iso(2026, 8, 25, 12), "16 citizens", "citizen"),
      event("n2", "under_review", "Under review", iso(2026, 8, 26, 9), "AMA", "agency"),
      event("n3", "assigned", "Assigned", iso(2026, 8, 27, 10), "AMA Works", "agency"),
    ],
    evidence: [evidence("CGH-2026-0010", "before", "drain-before", iso(2026, 8, 25, 12), "Citizen reports")],
  };

  return [drain, pothole, flood, light, waste, water, closure, disputed, repaired, nimaDrain];
}

const TEMPLATES: {
  title: string;
  category: Category;
  description: string;
  photoKey: string;
  isRoadRelated: boolean;
  roadHazard?: RoadHazard;
  agencyHint?: string;
}[] = [
  { title: "Pothole on carriageway", category: "roads", description: "A pothole is widening in the travel lane and catching tyres.", photoKey: "pothole-before", isRoadRelated: true, roadHazard: "pothole", agencyHint: "dur" },
  { title: "Damaged road shoulder", category: "roads", description: "The road edge has broken away, forcing vehicles toward the centre line.", photoKey: "pothole-before", isRoadRelated: true, roadHazard: "damaged_road", agencyHint: "gha" },
  { title: "Road obstruction", category: "roads", description: "Debris and informal barriers are blocking part of the carriageway.", photoKey: "construction-before", isRoadRelated: true, roadHazard: "obstruction", agencyHint: "ama" },
  { title: "Active road construction", category: "roads", description: "Construction has reduced the road to one passable lane.", photoKey: "construction-before", isRoadRelated: true, roadHazard: "construction", agencyHint: "dur" },
  { title: "Standing flood water", category: "flooding", description: "Rainwater collects here and remains for hours after the storm.", photoKey: "flood-before", isRoadRelated: true, roadHazard: "flooding", agencyHint: "nadmo" },
  { title: "Blocked roadside drain", category: "drainage", description: "Silt and refuse have blocked the drain, pushing water onto the street.", photoKey: "drain-before", isRoadRelated: false, agencyHint: "ama" },
  { title: "Overflowing refuse skip", category: "waste", description: "The communal skip is overflowing onto the walkway.", photoKey: "waste-before", isRoadRelated: false, agencyHint: "zoomlion" },
  { title: "Dark streetlight pole", category: "streetlights", description: "This pole is out, leaving the junction poorly lit after dusk.", photoKey: "light-before", isRoadRelated: false, agencyHint: "ecg" },
  { title: "Broken traffic signal", category: "streetlights", description: "The signal is stuck or dark, creating confusion at the junction.", photoKey: "light-before", isRoadRelated: true, roadHazard: "traffic_light", agencyHint: "ecg" },
  { title: "Low water pressure / leak", category: "water", description: "A visible leak is wasting treated water and wetting the road edge.", photoKey: "water-before", isRoadRelated: false, agencyHint: "gwcl" },
  { title: "Broken public bench / stop", category: "public_infrastructure", description: "The public stop shelter is damaged and unused.", photoKey: "infra-before", isRoadRelated: false, agencyHint: "ama" },
  { title: "Open manhole", category: "public_infrastructure", description: "An uncovered manhole is a hazard to pedestrians and motorcycles.", photoKey: "infra-before", isRoadRelated: false, agencyHint: "gwcl" },
];

const STATUSES: IssueStatus[] = [
  "reported",
  "reported",
  "under_review",
  "assigned",
  "assigned",
  "in_progress",
  "in_progress",
  "resolved",
  "verified",
  "disputed",
];

const SEVERITIES: Severity[] = ["low", "medium", "medium", "high", "high", "critical"];

const AREA_AGENCY: Record<string, string> = {
  "east-legon": "ayawaso",
  osu: "ama",
  labone: "ladma",
  cantonments: "ladma",
  airport: "ladma",
  dzorwulu: "ayawaso",
  madina: "ga-east",
  adenta: "ga-east",
  legon: "ga-east",
  haatso: "ga-east",
  spintex: "ledzokuku",
  teshie: "ledzokuku",
  nungua: "ledzokuku",
  tema: "tma",
  kaneshie: "ama",
  dansoman: "ablekuma",
  nima: "ama",
  achimota: "ga-west",
  circle: "ama",
  "accra-central": "ama",
  "korle-bu": "ama",
  adabraka: "ama",
  lapaz: "ga-west",
  ofankor: "ga-west",
  shiashie: "ayawaso",
  "airport-city": "ayawaso",
  weija: "ablekuma",
  dome: "ga-east",
};

function timelineFor(status: IssueStatus, reportedAt: string, id: string, agencyName: string): TimelineEvent[] {
  const start = new Date(reportedAt).getTime();
  const add = (days: number, hours = 0) => new Date(start + days * 86400000 + hours * 3600000).toISOString();
  const events: TimelineEvent[] = [event(`${id}-r`, "reported", "Reported", reportedAt, "Citizens", "citizen")];
  const order: { key: IssueStatus | "agency_accepted" | "work_started" | "citizen_verified" | "reopened"; label: string; day: number }[] = [
    { key: "under_review", label: "Under review", day: 0 },
    { key: "assigned", label: "Assigned", day: 1 },
    { key: "agency_accepted", label: "Agency accepted", day: 1 },
    { key: "work_started", label: "Work started", day: 2 },
    { key: "in_progress", label: "In progress", day: 2 },
    { key: "resolved", label: "Resolved", day: 4 },
    { key: "citizen_verified", label: "Citizen verified", day: 5 },
    { key: "verified", label: "Verified", day: 5 },
  ];
  const stop: Record<string, number> = {
    reported: 0,
    under_review: 1,
    assigned: 3,
    in_progress: 5,
    resolved: 6,
    verified: 8,
    disputed: 6,
  };
  const n = stop[status] ?? 0;
  order.slice(0, n).forEach((step, i) => {
    events.push(
      event(
        `${id}-${i}`,
        step.key,
        step.label,
        add(step.day, 8 + i),
        agencyName,
        "agency",
      ),
    );
  });
  if (status === "disputed") {
    events.push(event(`${id}-x`, "reopened", "Disputed / reopened", add(6, 12), "Citizens", "citizen"));
  }
  return events;
}

function generatedIssues(): Issue[] {
  const issues: Issue[] = [];
  const clusters = [
    { area: "east-legon", n: 10, street: "East Legon Avenue" },
    { area: "osu", n: 7, street: "Oxford Street" },
    { area: "spintex", n: 11, street: "Spintex Road" },
    { area: "madina", n: 8, street: "Madina-Adenta Road" },
    { area: "nima", n: 9, street: "Nima Highway" },
    { area: "kaneshie", n: 6, street: "Winneba Road" },
    { area: "dansoman", n: 6, street: "Dansoman High Street" },
    { area: "circle", n: 8, street: "Ring Road Central" },
    { area: "tema", n: 6, street: "Harbour Road" },
    { area: "achimota", n: 7, street: "Achimota–Ofankor Road" },
    { area: "labone", n: 5, street: "Labone Crescent" },
    { area: "teshie", n: 6, street: "Giffard Road" },
    { area: "lapaz", n: 5, street: "Winneba Road" },
    { area: "legon", n: 5, street: "Legon Road" },
    { area: "accra-central", n: 7, street: "High Street" },
  ];

  let n = 11;
  for (const cluster of clusters) {
    for (let i = 0; i < cluster.n; i++) {
      const tpl = pick(TEMPLATES);
      const status = pick(STATUSES);
      const day = 3 + Math.floor(rand() * 28);
      const reportedAt = iso(2026, 8, Math.min(31, day), 7 + Math.floor(rand() * 12));
      const id = `CGH-2026-${String(n).padStart(4, "0")}`;
      const agencyId = tpl.agencyHint && rand() > 0.35 ? tpl.agencyHint : AREA_AGENCY[cluster.area] ?? "ama";
      const location = loc(cluster.area, cluster.street, 0.01);
      const reporters = 1 + Math.floor(rand() * 16);
      const last = new Date(new Date(reportedAt).getTime() + Math.floor(rand() * 6) * 86400000).toISOString();
      const ev: Evidence[] = [
        evidence(id, "before", tpl.photoKey, reportedAt, "Citizen reports"),
      ];
      if (status === "in_progress" || status === "resolved" || status === "verified" || status === "disputed") {
        ev.push(evidence(id, "during", tpl.photoKey.replace("before", "during"), last, "Agency crew", agencyId));
      }
      if (status === "resolved" || status === "verified" || status === "disputed") {
        ev.push(evidence(id, "after", tpl.photoKey.replace("before", "after"), last, "Agency crew", agencyId));
      }
      issues.push({
        id,
        title: `${tpl.title}`,
        category: tpl.category,
        description: `${tpl.description} Reported near ${location.publicLabel}.`,
        photoKey: tpl.photoKey,
        location,
        reportedAt,
        agencyId,
        status,
        reporterCount: reporters,
        affectedCount: reporters,
        lastUpdateAt: last,
        timeline: timelineFor(status, reportedAt, id, agencyId.toUpperCase()),
        evidence: ev,
        isRoadRelated: tpl.isRoadRelated,
        roadHazard: tpl.roadHazard,
        severity: pick(SEVERITIES),
        supportingReports: reporters,
        denials: status === "disputed" ? 1 + Math.floor(rand() * 3) : 0,
        confidence: 0.3 + rand() * 0.6,
        roadSegmentId: tpl.isRoadRelated
          ? cluster.area === "spintex"
            ? "spintex-rd"
            : cluster.area === "east-legon"
              ? "east-legon-ave"
              : cluster.area === "circle"
                ? "ring-road-c"
                : cluster.area === "achimota"
                  ? "achimota-ofankor"
                  : cluster.area === "osu"
                    ? "osu-oxford"
                    : undefined
          : undefined,
        dueAt:
          status === "assigned" || status === "in_progress"
            ? iso(2026, 9, 1 + Math.floor(rand() * 8), 18)
            : undefined,
        verificationCount: status === "verified" ? Math.max(1, Math.floor(reporters * 0.7)) : 0,
        privacyOffset: { lat: 0, lng: 0 },
      });
      n += 1;
    }
  }
  return issues;
}

export const SEED_ISSUES: Issue[] = [...featuredIssues(), ...generatedIssues()];
