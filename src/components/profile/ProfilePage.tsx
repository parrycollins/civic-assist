"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCivicStore } from "@/lib/store";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { ThemeToggle } from "@/components/ui-kit/ThemeToggle";
import { MyCivicImpact } from "@/components/completed/MyCivicImpact";
import { fromNow } from "@/lib/format";

export function ProfilePage() {
  const router = useRouter();
  const user = useCivicStore((s) => s.user);
  const notifications = useCivicStore((s) => s.notifications);
  const markNotificationsRead = useCivicStore((s) => s.markNotificationsRead);
  const logout = useCivicStore((s) => s.logout);
  const resetDemo = useCivicStore((s) => s.resetDemo);
  const issues = useCivicStore((s) => s.issues);
  const myIssueIds = useCivicStore((s) => s.myIssueIds);
  const setRecognition = useCivicStore((s) => s.setRecognition);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-extrabold">Profile</h1>
        <ThemeToggle />
      </div>
      {user ? (
        <div className="card-lift rounded-[1.7rem] bg-card p-5">
          <p className="font-heading text-xl font-extrabold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-2 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase">
            {user.role}
          </p>
          {user.agencyId && <p className="mt-2 text-sm">Agency officer · {user.agencyId.toUpperCase()}</p>}
          {user.area && <p className="text-sm text-muted-foreground">Area: {user.area}</p>}
          {user.role === "citizen" && (
            <div className="mt-4 grid gap-2">
              <p className="text-sm font-semibold">Recognition on completed work</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`h-10 rounded-2xl px-3 text-xs font-bold ${user.recognition === "named" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                  onClick={() => setRecognition("named", user.displayName || user.name)}
                >
                  Show my name
                </button>
                <button
                  type="button"
                  className={`h-10 rounded-2xl px-3 text-xs font-bold ${user.recognition !== "named" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                  onClick={() => setRecognition("anonymous")}
                >
                  Show anonymously
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Email and phone are never shown on public pages.</p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="Browsing as a guest"
          body="The map is public. Reporting and verification need an account so agencies can follow the work."
          actionHref="/login"
          actionLabel="Sign in"
        />
      )}

      <MyCivicImpact issues={issues} user={user} myIssueIds={myIssueIds} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Notifications</h2>
          <button type="button" className="text-sm font-bold text-primary" onClick={markNotificationsRead}>
            Mark read
          </button>
        </div>
        {notifications.length === 0 ? (
          <EmptyState title="All quiet" body="When agencies update your reports, the updates will land here." />
        ) : (
          <ul className="grid gap-2">
            {notifications.map((n) => (
              <li key={n.id} className="card-lift rounded-[1.4rem] bg-card p-4 text-sm">
                <p className="font-semibold">{n.title}</p>
                <p className="text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px]">{fromNow(n.createdAt)}</p>
                {n.issueId && (
                  <Link href={`/issues/${n.issueId}`} className="text-xs font-bold text-primary">
                    Open complaint
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-lift rounded-[1.6rem] bg-card p-5 text-sm">
        <h2 className="font-heading font-bold">Privacy</h2>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
          <li>Phone numbers and emails are never shown on the public map.</li>
          <li>Pins use an approximate public location, not a private residence.</li>
          <li>Near Me shows a radius around an approximated area, not a live exact GPS pin.</li>
        </ul>
      </section>

      {user && (
        <button
          type="button"
          className="h-12 w-full rounded-2xl bg-card text-sm font-bold card-lift"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          Sign out
        </button>
      )}
      <button
        type="button"
        className="h-12 w-full rounded-2xl text-sm font-bold text-muted-foreground"
        onClick={() => {
          resetDemo();
          router.push("/");
        }}
      >
        Reset demo data
      </button>
    </div>
  );
}
