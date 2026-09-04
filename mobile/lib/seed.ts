import type { Issue, IssueStatus, Category } from "./types";

const agencies: Record<string, string> = {
  ayawaso: "Ayawaso West Municipal Assembly",
  dur: "Department of Urban Roads",
  nadmo: "National Disaster Management Organisation",
  ecg: "Electricity Company of Ghana",
  zoomlion: "Zoomlion Ghana Limited",
  ama: "Accra Metropolitan Assembly",
  gha: "Ghana Highway Authority",
};

function issue(input: {
  id: string;
  title: string;
  category: Category;
  description: string;
  photoKey: string;
  lat: number;
  lng: number;
  area: string;
  municipality: string;
  publicLabel: string;
  reportedAt: string;
  agencyId: string;
  status: IssueStatus;
  reporterCount: number;
  events: [string, string][];
}): Issue {
  const timeline = input.events.map(([time, label], index) => ({
    id: `${input.id}-t${index}`,
    status: label.toLowerCase(),
    label,
    timestamp: time,
    actor: index === 0 ? "Citizen Reporter" : agencies[input.agencyId] ?? "Agency",
  }));
  const stageCount =
    input.status === "verified" || input.status === "resolved"
      ? 3
      : input.status === "in_progress"
        ? 2
        : 1;
  const stages = (["before", "during", "after"] as const).slice(0, stageCount);
  return {
    id: input.id,
    title: input.title,
    category: input.category,
    description: input.description,
    photoKey: input.photoKey,
    location: {
      lat: input.lat,
      lng: input.lng,
      area: input.area,
      municipality: input.municipality,
      publicLabel: input.publicLabel,
    },
    reportedAt: input.reportedAt,
    agencyId: input.agencyId,
    agencyName: agencies[input.agencyId] ?? "Agency",
    status: input.status,
    reporterCount: input.reporterCount,
    timeline,
    evidence: stages.map((stage) => ({
      id: `${input.id}-${stage}`,
      stage,
      photoKey: `${input.photoKey}-${stage}`,
      timestamp: input.reportedAt,
      uploadedBy: stage === "before" ? "Citizen Reporter" : agencies[input.agencyId] ?? "Agency",
    })),
  };
}

export const seedIssues: Issue[] = [
  issue({
    id: "CGH-2026-0001",
    title: "Blocked Drain",
    category: "drainage",
    description:
      "The roadside drain on East Legon Avenue is fully silted. Stormwater spills onto the carriageway after even short rains.",
    photoKey: "drain",
    lat: 5.6362,
    lng: -0.1589,
    area: "East Legon",
    municipality: "Ayawaso West",
    publicLabel: "East Legon Avenue, East Legon",
    reportedAt: "2026-08-28T08:00:00Z",
    agencyId: "ayawaso",
    status: "verified",
    reporterCount: 14,
    events: [
      ["2026-08-28T08:00:00Z", "Reported"],
      ["2026-08-28T15:00:00Z", "Assigned"],
      ["2026-08-30T07:00:00Z", "Work started"],
      ["2026-09-01T17:00:00Z", "Resolved"],
      ["2026-09-02T16:00:00Z", "Citizen verified"],
    ],
  }),
  issue({
    id: "CGH-2026-0002",
    title: "Deep pothole on N1 eastbound",
    category: "roads",
    description: "A wide pothole on the Tema Motorway eastbound lanes near Spintex is catching vehicles.",
    photoKey: "pothole",
    lat: 5.641,
    lng: -0.092,
    area: "Spintex",
    municipality: "Ledzokuku",
    publicLabel: "N1 Tema Motorway, Spintex",
    reportedAt: "2026-08-26T07:00:00Z",
    agencyId: "dur",
    status: "in_progress",
    reporterCount: 9,
    events: [
      ["2026-08-26T07:00:00Z", "Reported"],
      ["2026-08-27T09:00:00Z", "Assigned"],
      ["2026-08-29T11:00:00Z", "Work started"],
    ],
  }),
  issue({
    id: "CGH-2026-0003",
    title: "Flooded carriageway after rain",
    category: "flooding",
    description: "Standing water covers the inner lane near the Circle underpass after rainfall.",
    photoKey: "flood",
    lat: 5.56,
    lng: -0.205,
    area: "Kwame Nkrumah Circle",
    municipality: "Accra Central",
    publicLabel: "Circle underpass, Accra Central",
    reportedAt: "2026-08-29T18:00:00Z",
    agencyId: "nadmo",
    status: "assigned",
    reporterCount: 7,
    events: [
      ["2026-08-29T18:00:00Z", "Reported"],
      ["2026-08-30T08:00:00Z", "Assigned"],
    ],
  }),
  issue({
    id: "CGH-2026-0005",
    title: "Uncollected waste at Dansoman High Street",
    category: "waste",
    description: "Skip containers have overflowed for four days beside the market.",
    photoKey: "waste",
    lat: 5.541,
    lng: -0.268,
    area: "Dansoman",
    municipality: "Ablekuma West",
    publicLabel: "Dansoman High Street, Dansoman",
    reportedAt: "2026-08-30T11:00:00Z",
    agencyId: "zoomlion",
    status: "resolved",
    reporterCount: 11,
    events: [
      ["2026-08-30T11:00:00Z", "Reported"],
      ["2026-08-30T16:00:00Z", "Assigned"],
      ["2026-09-01T08:00:00Z", "Work started"],
      ["2026-09-02T14:00:00Z", "Resolved"],
    ],
  }),
  issue({
    id: "CGH-2026-0009",
    title: "Streetlight repaired on Liberation Road",
    category: "streetlights",
    description: "The signal and streetlight at the 37 Hospital junction were restored.",
    photoKey: "light",
    lat: 5.5848,
    lng: -0.1804,
    area: "Airport Residential",
    municipality: "La Dade Kotopon",
    publicLabel: "Liberation Road, 37 Hospital junction",
    reportedAt: "2026-08-18T21:00:00Z",
    agencyId: "ecg",
    status: "verified",
    reporterCount: 6,
    events: [
      ["2026-08-18T21:00:00Z", "Reported"],
      ["2026-08-19T08:00:00Z", "Assigned"],
      ["2026-08-19T14:00:00Z", "Work started"],
      ["2026-08-20T18:00:00Z", "Resolved"],
      ["2026-08-21T20:00:00Z", "Citizen verified"],
    ],
  }),
  issue({
    id: "CGH-2026-0010",
    title: "Collapsed drain wall in Nima",
    category: "drainage",
    description: "A section of the Nima drain wall has collapsed, backing water toward nearby shops.",
    photoKey: "drain",
    lat: 5.586,
    lng: -0.196,
    area: "Nima",
    municipality: "Ayawaso East",
    publicLabel: "Nima Highway, Nima",
    reportedAt: "2026-08-25T12:00:00Z",
    agencyId: "ama",
    status: "assigned",
    reporterCount: 16,
    events: [
      ["2026-08-25T12:00:00Z", "Reported"],
      ["2026-08-27T10:00:00Z", "Assigned"],
    ],
  }),
];

export const accounts = [
  { email: "ama@civicgh.gh", password: "civic2026", user: { name: "Ama Mensah", email: "ama@civicgh.gh", role: "citizen" as const, recognition: "anonymous" as const } },
  { email: "officer@ama.gov.gh", password: "agency2026", user: { name: "Kwame Asante", email: "officer@ama.gov.gh", role: "agency" as const, recognition: "anonymous" as const } },
  { email: "roads@dur.gov.gh", password: "agency2026", user: { name: "Efua Boateng", email: "roads@dur.gov.gh", role: "agency" as const, recognition: "anonymous" as const } },
];
