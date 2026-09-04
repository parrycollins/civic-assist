"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AGENCIES } from "@/data/agencies";
import { SEED_ISSUES } from "@/data/issues";
import { DEMO_ACCOUNTS, SEED_VERSION } from "@/lib/constants";
import { approximateLocation } from "@/lib/geo";
import { areaForPoint } from "@/data/areas";
import {
  FORWARD_THRESHOLD,
  findLocationCluster,
  locationClusterKey,
  type DispatchResult,
} from "@/lib/dispatch";
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
  addIssue: (input: NewIssueInput) => DispatchResult;
  updateIssueStatus: (
    id: string,
    status: IssueStatus,
    note?: string,
    extra?: { dueAt?: string },
  ) => void;
  addEvidence: (
    id: string,
    stage: EvidenceStage,
    photo: { photoKey?: string; imageDataUrl?: string; videoDataUrl?: string; fileType?: string },
    description?: string,
  ) => void;
  setRecognition: (recognition: "named" | "anonymous", displayName?: string) => void;
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

function syncCivicCloud(result: DispatchResult, lat: number, lng: number) {
  if (typeof window === "undefined") return;
  void fetch("/api/cloud/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: `${result.issue.id}-c${result.rank}-${Date.now()}`,
      issueId: result.issue.id,
      category: result.issue.category,
      roadHazard: result.issue.roadHazard,
      lat,
      lng,
      clusterKey: result.issue.clusterKey ?? result.issue.id,
      rank: result.rank,
      count: result.count,
      forwarded: result.forwarded,
      justForwarded: result.justForwarded,
      joinedExisting: result.joinedExisting,
      createdAt: new Date().toISOString(),
    }),
  }).catch(() => {
    /* Cloud copy is best-effort; the local CivicGH store remains the working record. */
  });
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
        const merged = [...get().accounts];
        for (const demo of demoAccounts) {
          if (!merged.some((a) => a.email === demo.email)) merged.push(demo);
        }
        const account = merged.find((a) => a.email === email);
        if (!account || account.password !== password) return "Email or password is incorrect.";
        set({ user: account.user, accounts: merged });
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
          recognition: "anonymous",
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
        const now = new Date().toISOString();
        const user = get().user;
        const agencyId = input.agencyId ?? defaultAgency(input.category, area.municipality);
        const clusterKey = locationClusterKey(input.category, approx, input.roadHazard);
        const existing = findLocationCluster(get().issues, {
          category: input.category,
          lat: approx.lat,
          lng: approx.lng,
          roadHazard: input.roadHazard,
        });
        const responsibleId = existing?.agencyId ?? agencyId;
        const agency = AGENCIES.find((a) => a.id === responsibleId);

        if (existing) {
          const alreadyReported = Boolean(user?.id && existing.contributorIds?.includes(user.id));
          if (alreadyReported) {
            const result: DispatchResult = {
              issue: existing,
              rank: Math.max(1, existing.contributorIds?.indexOf(user!.id) ?? 0) + 1,
              count: existing.complaintCount ?? existing.reporterCount,
              threshold: FORWARD_THRESHOLD,
              forwarded: Boolean(existing.forwardedToAgency),
              justForwarded: false,
              joinedExisting: true,
              alreadyReported: true,
            };
            set((s) => ({
              myIssueIds: s.myIssueIds.includes(existing.id) ? s.myIssueIds : [existing.id, ...s.myIssueIds],
            }));
            syncCivicCloud(result, approx.lat, approx.lng);
            return result;
          }

          const count = (existing.complaintCount ?? existing.reporterCount) + 1;
          const wasForwarded = Boolean(existing.forwardedToAgency);
          const justForwarded = !wasForwarded && count >= FORWARD_THRESHOLD;
          const forwarded = wasForwarded || justForwarded;
          const extraEvidence: Evidence | undefined = input.imageDataUrl
            ? {
                id: `${existing.id}-before-${now}`,
                complaintId: existing.id,
                stage: "before",
                photoKey: input.photoKey ?? `${input.category}-before`,
                imageDataUrl: input.imageDataUrl,
                timestamp: now,
                uploadedBy: user?.name ?? "Citizen",
                uploadedByRole: "citizen",
                description: "Additional citizen report",
              }
            : undefined;
          const updated: Issue = {
            ...existing,
            lastUpdateAt: now,
            reporterCount: count,
            complaintCount: count,
            supportingReports: existing.supportingReports + 1,
            affectedCount: (existing.affectedCount ?? existing.reporterCount) + 1,
            confidence: Math.min(0.98, existing.confidence + 0.08),
            clusterKey: existing.clusterKey ?? clusterKey,
            forwardedToAgency: forwarded,
            forwardedAt: justForwarded ? now : existing.forwardedAt,
            contributorIds: user?.id
              ? Array.from(new Set([...(existing.contributorIds ?? []), user.id]))
              : existing.contributorIds ?? [],
            status: justForwarded && existing.status === "reported" ? "under_review" : existing.status,
            timeline: [
              ...existing.timeline,
              {
                id: `${existing.id}-c-${now}`,
                status: "reported",
                label: `Citizen report ${count} of ${FORWARD_THRESHOLD} stored in CivicGH Cloud`,
                timestamp: now,
                actor: user?.recognition === "named" ? user.name : "CivicGH Citizen",
                actorRole: "citizen",
              },
              ...(justForwarded
                ? [
                    {
                      id: `${existing.id}-fwd-${now}`,
                      status: "under_review" as const,
                      label: `Forwarded to ${agency?.name ?? "the responsible agency"} after ${FORWARD_THRESHOLD} nearby reports`,
                      timestamp: now,
                      actor: "CivicGH Cloud",
                      actorRole: "system" as const,
                    },
                  ]
                : []),
            ],
            evidence: extraEvidence ? [...existing.evidence, extraEvidence] : existing.evidence,
          };
          const result: DispatchResult = {
            issue: updated,
            rank: count,
            count,
            threshold: FORWARD_THRESHOLD,
            forwarded,
            justForwarded,
            joinedExisting: true,
            alreadyReported: false,
          };
          set((s) => ({
            issues: s.issues.map((issue) => (issue.id === existing.id ? updated : issue)),
            myIssueIds: s.myIssueIds.includes(existing.id) ? s.myIssueIds : [existing.id, ...s.myIssueIds],
            notifications: [
              notify(
                justForwarded ? "Forwarded to the agency" : "Report stored in CivicGH Cloud",
                justForwarded
                  ? `${agency?.name ?? "The agency"} has been notified. ${count} nearby complaints matched this location.`
                  : `${count} of ${FORWARD_THRESHOLD} nearby reports. CivicGH will forward this after ${FORWARD_THRESHOLD} complaints.`,
                existing.id,
              ),
              ...s.notifications,
            ],
          }));
          syncCivicCloud(result, approx.lat, approx.lng);
          return result;
        }

        const id = `CGH-2026-${String(get().issues.length + 1).padStart(4, "0")}`;
        const forwarded = 1 >= FORWARD_THRESHOLD;
        const evidence: Evidence[] = [
          {
            id: `${id}-before`,
            complaintId: id,
            stage: "before",
            photoKey: input.photoKey ?? `${input.category}-before`,
            imageDataUrl: input.imageDataUrl,
            timestamp: now,
            uploadedBy: user?.name ?? "Citizen",
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
          status: forwarded ? "under_review" : "reported",
          reporterCount: 1,
          complaintCount: 1,
          lastUpdateAt: now,
          timeline: [
            {
              id: `${id}-r`,
              status: "reported",
              label: "Reported",
              timestamp: now,
              actor: user?.name ?? "Citizen",
              actorRole: "citizen",
            },
            ...(forwarded
              ? [
                  {
                    id: `${id}-fwd`,
                    status: "under_review" as const,
                    label: `Forwarded to ${agency?.name ?? "the responsible agency"} after ${FORWARD_THRESHOLD} nearby reports`,
                    timestamp: now,
                    actor: "CivicGH Cloud",
                    actorRole: "system" as const,
                  },
                ]
              : []),
          ],
          evidence,
          isRoadRelated: Boolean(input.isRoadRelated || input.roadHazard),
          roadHazard: input.roadHazard,
          severity: input.severity ?? "medium",
          supportingReports: 1,
          denials: 0,
          confidence: 0.35,
          verificationCount: 0,
          createdById: user?.id,
          reporterVisibility: user?.recognition === "named" ? "named" : "anonymous",
          reporterDisplayName: user?.displayName || user?.name,
          privacyOffset: { lat: 0, lng: 0 },
          clusterKey,
          forwardedToAgency: forwarded,
          forwardedAt: forwarded ? now : undefined,
          contributorIds: user?.id ? [user.id] : [],
        };
        const result: DispatchResult = {
          issue,
          rank: 1,
          count: 1,
          threshold: FORWARD_THRESHOLD,
          forwarded,
          justForwarded: forwarded,
          joinedExisting: false,
          alreadyReported: false,
        };
        set((s) => ({
          issues: [issue, ...s.issues],
          myIssueIds: [id, ...s.myIssueIds],
          notifications: [
            notify(
              "Report stored in CivicGH Cloud",
              `You are the first to report this at ${area.name}. CivicGH will forward it to ${agency?.name ?? "the agency"} after ${FORWARD_THRESHOLD} nearby complaints.`,
              id,
            ),
            ...s.notifications,
          ],
        }));
        syncCivicCloud(result, approx.lat, approx.lng);
        return result;
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
            notify(
              status === "resolved" ? "Awaiting citizen verification" : "Status updated",
              status === "resolved"
                ? "The agency marked this work complete. Citizens can confirm or dispute it."
                : `${labelMap[status]}${note ? ` — ${note}` : ""}`,
              id,
            ),
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
          kind: photo.videoDataUrl ? "video" : "photo",
          videoDataUrl: photo.videoDataUrl,
          fileType: photo.fileType,
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
      setRecognition: (recognition, displayName) => {
        const user = get().user;
        if (!user) return;
        const next = { ...user, recognition, displayName: displayName?.trim() || user.displayName };
        set((s) => ({
          user: next,
          accounts: s.accounts.map((a) => (a.user.id === user.id ? { ...a, user: next } : a)),
          issues: s.issues.map((issue) =>
            issue.createdById === user.id
              ? {
                  ...issue,
                  reporterVisibility: recognition,
                  reporterDisplayName: next.displayName || next.name,
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
