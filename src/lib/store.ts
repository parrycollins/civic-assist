"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AGENCIES } from "@/data/agencies";
import { SEED_ISSUES } from "@/data/issues";
import { DEMO_ACCOUNTS, SEED_VERSION } from "@/lib/constants";
import { approximateLocation } from "@/lib/geo";
import { areaForPoint } from "@/data/areas";
import type {
  AppNotification,
  Category,
  Evidence,
  EvidenceStage,
  Issue,
  IssueStatus,
  RoadFeedback,
  RoadHazard,
  Severity,
  User,
} from "@/lib/types";

export interface CivicState {
  seedVersion: number;
  user: User | null;
  accounts: { email: string; password: string; user: User }[];
  issues: Issue[];
  notifications: AppNotification[];
  myIssueIds: string[];
  confirmedIssueIds: string[];
  roadFeedback: RoadFeedback[];
  hydrated: boolean;
  login: (email: string, password: string) => string | null;
  register: (name: string, email: string, password: string, area?: string) => string | null;
  logout: () => void;
  addIssue: (input: NewIssueInput) => Issue;
  updateIssueStatus: (
    id: string,
    status: IssueStatus,
    note?: string,
    extra?: { dueAt?: string },
  ) => void;
  addEvidence: (
    id: string,
    stage: EvidenceStage,
    photo: { photoKey?: string; imageDataUrl?: string },
    description?: string,
  ) => void;
  verifyIssue: (id: string) => void;
  disputeIssue: (id: string, note?: string) => void;
  confirmIssue: (id: string, exists: boolean) => void;
  markNotificationsRead: () => void;
  addRoadFeedback: (feedback: Omit<RoadFeedback, "id" | "createdAt">) => void;
  resetDemo: () => void;
}

export interface NewIssueInput {
  title: string;
  category: Category;
  description: string;
  lat: number;
  lng: number;
  photoKey?: string;
  imageDataUrl?: string;
  isRoadRelated?: boolean;
  roadHazard?: RoadHazard;
  severity?: Severity;
  agencyId?: string;
}

const demoAccounts: CivicState["accounts"] = DEMO_ACCOUNTS.map((a) => ({
  email: a.email,
  password: a.password,
  user: {
    id: a.email,
    name: a.name,
    email: a.email,
    role: a.role,
    agencyId: "agencyId" in a ? a.agencyId : undefined,
    area: "area" in a ? a.area : undefined,
  },
}));

function notify(title: string, body: string, issueId?: string): AppNotification {
  return {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    body,
    issueId,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

function defaultAgency(category: Category, municipality: string) {
  if (category === "water") return "gwcl";
  if (category === "streetlights") return "ecg";
  if (category === "waste") return "zoomlion";
  if (category === "flooding") return "nadmo";
  if (category === "roads") return "dur";
  const match = AGENCIES.find((a) =>
    a.jurisdiction.some((j) => municipality.toLowerCase().includes(j.toLowerCase()) || j.toLowerCase().includes(municipality.toLowerCase())),
  );
  return match?.id ?? "ama";
}

export const useCivicStore = create<CivicState>()(
  persist(
    (set, get) => ({
      seedVersion: SEED_VERSION,
      user: null,
      accounts: demoAccounts,
      issues: SEED_ISSUES,
      notifications: [
        notify(
          "Drain cleared in East Legon",
          "The blocked drain on East Legon Avenue was resolved and citizen-verified.",
          "CGH-2026-0001",
        ),
        notify(
          "Road work started on the N1",
          "Department of Urban Roads has begun patching the Spintex pothole.",
          "CGH-2026-0002",
        ),
      ],
      myIssueIds: [],
      confirmedIssueIds: [],
      roadFeedback: [],
      hydrated: false,
      login: (email, password) => {
        const account = get().accounts.find((a) => a.email === email);
        if (!account || account.password !== password) return "Email or password is incorrect.";
        set({ user: account.user });
        return null;
      },
      register: (name, email, password, area) => {
        if (!name.trim() || !email.trim() || password.length < 6) {
          return "Enter your name, email, and a password of at least 6 characters.";
        }
        if (get().accounts.some((a) => a.email === email)) {
          return "An account with that email already exists.";
        }
        const user: User = {
          id: email,
          name,
          email,
          role: "citizen",
          area,
        };
        set((s) => ({
          user,
          accounts: [...s.accounts, { email, password, user }],
        }));
        return null;
      },
      logout: () => set({ user: null }),
      addIssue: (input) => {
        const approx = approximateLocation({ lat: input.lat, lng: input.lng });
        const area = areaForPoint(approx.lat, approx.lng);
        const id = `CGH-2026-${String(get().issues.length + 1).padStart(4, "0")}`;
        const now = new Date().toISOString();
        const agencyId = input.agencyId ?? defaultAgency(input.category, area.municipality);
        const agency = AGENCIES.find((a) => a.id === agencyId);
        const evidence: Evidence[] = [
          {
            id: `${id}-before`,
            complaintId: id,
            stage: "before",
            photoKey: input.photoKey ?? `${input.category}-before`,
            imageDataUrl: input.imageDataUrl,
            timestamp: now,
            uploadedBy: get().user?.name ?? "Citizen",
            uploadedByRole: "citizen",
            description: "Original report",
          },
        ];
        const issue: Issue = {
          id,
          title: input.title,
          category: input.category,
          description: input.description,
          photoKey: input.photoKey ?? `${input.category}-before`,
          location: {
            ...approx,
            area: area.name,
            municipality: area.municipality,
            publicLabel: `${area.name}`,
          },
          reportedAt: now,
          agencyId,
          status: "reported",
          reporterCount: 1,
          lastUpdateAt: now,
          timeline: [
            {
              id: `${id}-r`,
              status: "reported",
              label: "Reported",
              timestamp: now,
              actor: get().user?.name ?? "Citizen",
              actorRole: "citizen",
            },
          ],
          evidence,
          isRoadRelated: Boolean(input.isRoadRelated || input.roadHazard),
          roadHazard: input.roadHazard,
          severity: input.severity ?? "medium",
          supportingReports: 1,
          denials: 0,
          confidence: 0.35,
          verificationCount: 0,
          createdById: get().user?.id,
          privacyOffset: { lat: 0, lng: 0 },
        };
        set((s) => ({
          issues: [issue, ...s.issues],
          myIssueIds: [id, ...s.myIssueIds],
          notifications: [
            notify(
              "Report submitted",
              `${agency?.name ?? "The responsible agency"} has been notified about ${input.title}.`,
              id,
            ),
            ...s.notifications,
          ],
        }));
        return issue;
      },
      updateIssueStatus: (id, status, note, extra) => {
        const user = get().user;
        const now = new Date().toISOString();
        const labelMap: Record<IssueStatus, string> = {
          reported: "Reported",
          under_review: "Under review",
          assigned: "Assigned",
          in_progress: "Work started",
          resolved: "Resolved",
          verified: "Citizen verified",
          disputed: "Disputed / reopened",
        };
        set((s) => ({
          issues: s.issues.map((issue) => {
            if (issue.id !== id) return issue;
            return {
              ...issue,
              status,
              lastUpdateAt: now,
              dueAt: extra?.dueAt ?? issue.dueAt,
              timeline: [
                ...issue.timeline,
                {
                  id: `${id}-${now}`,
                  status,
                  label: labelMap[status],
                  timestamp: now,
                  actor: user?.name ?? "Agency",
                  actorRole: user?.role ?? "agency",
                  note,
                },
              ],
            };
          }),
          notifications: [
            notify("Status updated", `${labelMap[status]}${note ? ` — ${note}` : ""}`, id),
            ...s.notifications,
          ],
        }));
      },
      addEvidence: (id, stage, photo, description) => {
        const user = get().user;
        const now = new Date().toISOString();
        const record: Evidence = {
          id: `${id}-${stage}-${now}`,
          complaintId: id,
          stage,
          photoKey: photo.photoKey ?? `${stage}-upload`,
          imageDataUrl: photo.imageDataUrl,
          timestamp: now,
          uploadedBy: user?.name ?? "Agency officer",
          uploadedByRole: user?.role ?? "agency",
          agencyId: user?.agencyId,
          description,
        };
        set((s) => ({
          issues: s.issues.map((issue) =>
            issue.id === id
              ? {
                  ...issue,
                  lastUpdateAt: now,
                  evidence: [...issue.evidence, record],
                }
              : issue,
          ),
        }));
      },
      verifyIssue: (id) => {
        const now = new Date().toISOString();
        const user = get().user;
        set((s) => ({
          issues: s.issues.map((issue) => {
            if (issue.id !== id) return issue;
            const verificationCount = issue.verificationCount + 1;
            const status: IssueStatus =
              verificationCount >= Math.max(2, Math.ceil(issue.reporterCount * 0.5))
                ? "verified"
                : issue.status === "resolved"
                  ? "resolved"
                  : issue.status;
            return {
              ...issue,
              verificationCount,
              status,
              lastUpdateAt: now,
              timeline:
                status === "verified" && issue.status !== "verified"
                  ? [
                      ...issue.timeline,
                      {
                        id: `${id}-v-${now}`,
                        status: "citizen_verified",
                        label: "Citizen verified",
                        timestamp: now,
                        actor: user?.name ?? "Citizen",
                        actorRole: "citizen",
                      },
                    ]
                  : issue.timeline,
            };
          }),
        }));
      },
      disputeIssue: (id, note) => {
        get().updateIssueStatus(id, "disputed", note);
      },
      confirmIssue: (id, exists) => {
        set((s) => ({
          confirmedIssueIds: exists ? Array.from(new Set([...s.confirmedIssueIds, id])) : s.confirmedIssueIds,
          issues: s.issues.map((issue) => {
            if (issue.id !== id) return issue;
            const supporting = exists ? issue.supportingReports + 1 : issue.supportingReports;
            const denials = exists ? issue.denials : issue.denials + 1;
            const confidence = Math.max(
              0.05,
              Math.min(0.98, issue.confidence + (exists ? 0.08 : -0.12)),
            );
            return { ...issue, supportingReports: supporting, denials, confidence };
          }),
        }));
      },
      markNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      addRoadFeedback: (feedback) =>
        set((s) => ({
          roadFeedback: [
            {
              ...feedback,
              id: `fb-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...s.roadFeedback,
          ],
        })),
      resetDemo: () =>
        set({
          seedVersion: SEED_VERSION,
          issues: SEED_ISSUES,
          notifications: [],
          myIssueIds: [],
          confirmedIssueIds: [],
          roadFeedback: [],
          user: null,
          accounts: demoAccounts,
        }),
    }),
    {
      name: "civicgh-mvp",
      partialize: (s) => ({
        seedVersion: s.seedVersion,
        user: s.user,
        accounts: s.accounts,
        issues: s.issues,
        notifications: s.notifications,
        myIssueIds: s.myIssueIds,
        confirmedIssueIds: s.confirmedIssueIds,
        roadFeedback: s.roadFeedback,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<CivicState> | undefined;
        if (!p || p.seedVersion !== SEED_VERSION) return current;
        return { ...current, ...p, hydrated: true };
      },
    },
  ),
);

export function useHydratedCivicStore<T>(selector: (s: CivicState) => T): T {
  return useCivicStore(selector);
}
