import { create } from "zustand";
import { accounts, seedIssues } from "./seed";
import type { Category, Issue, User } from "./types";
import { statusLayer } from "./types";

const NOW = "2026-09-03T12:00:00Z";

interface CivicState {
  issues: Issue[];
  user: User | null;
  dark: boolean;
  completedLayer: boolean;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  setRecognition: (named: boolean) => void;
  toggleDark: () => void;
  setCompletedLayer: (enabled: boolean) => void;
  report: (title: string, category: Category, description: string) => Issue;
  verify: (id: string) => void;
  dispute: (id: string) => void;
}

export const useCivicStore = create<CivicState>((set, get) => ({
  issues: seedIssues,
  user: null,
  dark: false,
  completedLayer: false,

  login: (email, password) => {
    const account = accounts.find((item) => item.email === email && item.password === password);
    if (!account) return "Email or password is incorrect.";
    set({ user: account.user });
    return null;
  },

  logout: () => set({ user: null }),

  setRecognition: (named) => {
    const user = get().user;
    if (!user) return;
    set({ user: { ...user, recognition: named ? "named" : "anonymous" } });
  },

  toggleDark: () => set({ dark: !get().dark }),
  setCompletedLayer: (enabled) => set({ completedLayer: enabled }),

  report: (title, category, description) => {
    const { issues, user } = get();
    const id = `CGH-2026-${String(issues.length + 1).padStart(4, "0")}`;
    const issue: Issue = {
      id,
      title,
      category,
      description,
      photoKey: category,
      location: {
        lat: 5.6037,
        lng: -0.187,
        area: "Accra",
        municipality: "Accra Central",
        publicLabel: "Accra (approximate)",
      },
      reportedAt: NOW,
      agencyId: "ama",
      agencyName: "Accra Metropolitan Assembly",
      status: "reported",
      reporterCount: 1,
      timeline: [
        {
          id: `${id}-t0`,
          status: "reported",
          label: "Reported",
          timestamp: NOW,
          actor: user?.name ?? "Citizen",
        },
      ],
      evidence: [
        {
          id: `${id}-before`,
          stage: "before",
          photoKey: "before",
          timestamp: NOW,
          uploadedBy: "Citizen Reporter",
          description: "Original report",
        },
      ],
      createdByMe: true,
      reporterVisibility: user?.recognition ?? "anonymous",
    };
    set({ issues: [issue, ...issues] });
    return issue;
  },

  verify: (id) => {
    set({
      issues: get().issues.map((issue) => {
        if (issue.id !== id || issue.status !== "resolved") return issue;
        return {
          ...issue,
          status: "verified" as const,
          timeline: [
            ...issue.timeline,
            {
              id: `${id}-verified`,
              status: "verified",
              label: "Citizen verified",
              timestamp: NOW,
              actor: get().user?.name ?? "Citizen",
            },
          ],
        };
      }),
    });
  },

  dispute: (id) => {
    set({
      issues: get().issues.map((issue) => {
        if (issue.id !== id || issue.status !== "resolved") return issue;
        return {
          ...issue,
          status: "disputed" as const,
          timeline: [
            ...issue.timeline,
            {
              id: `${id}-disputed`,
              status: "disputed",
              label: "Citizen said this is not fixed",
              timestamp: NOW,
              actor: get().user?.name ?? "Citizen",
            },
          ],
        };
      }),
    });
  },
}));

export function completedIssues(issues: Issue[]): Issue[] {
  return issues
    .filter((issue) => statusLayer(issue.status) === "completed")
    .sort((a, b) => (b.timeline.at(-1)?.timestamp ?? b.reportedAt).localeCompare(a.timeline.at(-1)?.timestamp ?? a.reportedAt));
}

export function reporterLabel(issue: Issue, user: User | null): string {
  const named = issue.reporterVisibility === "named" || (issue.createdByMe && user?.recognition === "named");
  return named ? user?.name ?? "Citizen Reporter" : "Citizen Reporter";
}
