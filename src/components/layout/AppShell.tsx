"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUser,
  ClipboardList,
  Home,
  Map,
  Navigation,
  Megaphone,
} from "lucide-react";
import { useCivicStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const citizenItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/road-assist", label: "Road Assist", icon: Navigation },
  { href: "/report", label: "Report", icon: Megaphone },
  { href: "/my-reports", label: "My Reports", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: CircleUser },
];

const agencyItems = [
  { href: "/agency", label: "Home", icon: Home },
  { href: "/agency/map", label: "Map", icon: Map },
  { href: "/agency/roads", label: "Roads", icon: Navigation },
  { href: "/profile", label: "Profile", icon: CircleUser },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useCivicStore((s) => s.user);
  const unread = useCivicStore((s) => s.notifications.filter((n) => !n.read).length);
  const items = user?.role === "agency" ? agencyItems : citizenItems;
  const hideChrome = pathname === "/login" || pathname === "/register";

  const fullBleed =
    pathname === "/map" || pathname === "/road-assist" || pathname === "/agency/map";

  const active = useMemo(
    () =>
      items.find((i) =>
        i.href === "/" || i.href === "/agency"
          ? pathname === i.href
          : pathname.startsWith(i.href),
      ),
    [items, pathname],
  );

  if (hideChrome) {
    return <div className="min-h-dvh bg-background">{children}</div>;
  }

  return (
    <div className="flex h-dvh min-h-0 bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
        <Link href={user?.role === "agency" ? "/agency" : "/"} className="px-5 py-5">
          <p className="font-heading text-lg font-semibold tracking-tight">CivicGH</p>
          <p className="text-xs text-muted-foreground">Community problems &amp; public work</p>
        </Link>
        <nav className="grid gap-1 px-3">
          {items.map((item) => {
            const isActive =
              item.href === "/" || item.href === "/agency"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
                {item.label}
                {item.href === "/profile" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-destructive px-1.5 text-[10px] text-white">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4 text-xs text-muted-foreground">
          {user ? (
            <p>
              Signed in as <span className="font-medium text-foreground">{user.name}</span>
            </p>
          ) : (
            <Link href="/login" className="text-primary underline">
              Sign in
            </Link>
          )}
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <div>
            <p className="font-heading text-base font-semibold">CivicGH</p>
            <p className="text-[11px] text-muted-foreground">{active?.label ?? "Ghana"}</p>
          </div>
          <Link href="/login" className="text-sm font-medium text-primary">
            {user ? user.name.split(" ")[0] : "Sign in"}
          </Link>
        </header>
        <main
          className={cn(
            "flex-1",
            fullBleed ? "min-h-0 overflow-hidden" : "overflow-y-auto pb-20 md:pb-0",
          )}
        >
          {children}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          {citizenItems.map((item) => {
            const href =
              user?.role === "agency"
                ? item.href === "/"
                  ? "/agency"
                  : item.href === "/map"
                    ? "/agency/map"
                    : item.href === "/road-assist"
                      ? "/agency/roads"
                      : item.href
                : item.href;
            const isActive = pathname === href || (href !== "/" && href !== "/agency" && pathname.startsWith(href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
