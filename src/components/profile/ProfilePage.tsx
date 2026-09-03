"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCivicStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { fromNow } from "@/lib/format";

export function ProfilePage() {
  const router = useRouter();
  const user = useCivicStore((s) => s.user);
  const notifications = useCivicStore((s) => s.notifications);
  const markNotificationsRead = useCivicStore((s) => s.markNotificationsRead);
  const logout = useCivicStore((s) => s.logout);
  const resetDemo = useCivicStore((s) => s.resetDemo);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <h1 className="font-heading text-2xl font-semibold">Profile</h1>
      {user ? (
        <div className="rounded-2xl border p-4">
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs uppercase">{user.role}</p>
          {user.agencyId && <p className="text-sm">Agency officer · {user.agencyId.toUpperCase()}</p>}
          {user.area && <p className="text-sm">Area: {user.area}</p>}
        </div>
      ) : (
        <div className="rounded-2xl border p-4">
          <p>You are browsing as a guest. The map is public; reporting and verification need an account.</p>
          <div className="mt-3 flex gap-2">
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading font-semibold">Notifications</h2>
          <Button size="sm" variant="ghost" onClick={markNotificationsRead}>
            Mark read
          </Button>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <ul className="grid gap-2">
            {notifications.map((n) => (
              <li key={n.id} className="rounded-xl border p-3 text-sm">
                <p className="font-medium">{n.title}</p>
                <p className="text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px]">{fromNow(n.createdAt)}</p>
                {n.issueId && (
                  <Link href={`/issues/${n.issueId}`} className="text-xs text-primary">
                    Open complaint
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border p-4 text-sm">
        <h2 className="font-heading font-semibold">Privacy</h2>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
          <li>Phone numbers and emails are never shown on the public map.</li>
          <li>Pins use an approximate public location, not a private residence.</li>
          <li>Near Me shows a radius around an approximated area, not a live exact GPS pin.</li>
        </ul>
      </section>

      {user && (
        <Button
          variant="outline"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          Sign out
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={() => {
          resetDemo();
          router.push("/");
        }}
      >
        Reset demo data
      </Button>
    </div>
  );
}
