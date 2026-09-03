"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUser, Home, Map, Navigation, Plus } from "lucide-react";
import { useCivicStore } from "@/lib/store";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui-kit/ThemeToggle";
import { cn } from "@/lib/utils";

const citizenItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/report", label: "Report", icon: Plus, emphasize: true },
  { href: "/road-assist", label: "Road Assist", icon: Navigation },
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
  const hideChrome = pathname === "/login" || pathname === "/register";
  const fullBleed = pathname === "/map" || pathname === "/road-assist" || pathname === "/agency/map";

  if (hideChrome) {
    return <div className="min-h-dvh">{children}</div>;
  }

  return (
    <div className="flex h-dvh min-h-0">
      <aside className="hidden w-[17.5rem] shrink-0 flex-col border-r border-border/70 bg-sidebar/80 px-4 py-5 backdrop-blur-xl md:flex">
        <Link href={user?.role === "agency" ? "/agency" : "/"} className="px-2">
          <Logo />
        </Link>
        <nav className="mt-8 grid gap-1.5">
          {(user?.role === "agency" ? agencyItems : [...citizenItems, { href: "/my-reports", label: "My Reports", icon: CircleUser }]).map(
            (item) => {
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
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_rgb(13_79_60/0.9)]"
                      : "text-foreground/80 hover:bg-white/70",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                  {item.href === "/profile" && unread > 0 && (
                    <span className="ml-auto rounded-full bg-gold px-1.5 text-[10px] text-gold-foreground">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            },
          )}
        </nav>
        <div className="mt-auto space-y-3">
          <ThemeToggle className="grid size-10 place-items-center rounded-2xl bg-secondary text-foreground" />
          <div className="rounded-3xl bg-primary px-4 py-4 text-primary-foreground">
            <p className="text-xs font-medium text-primary-foreground/70">Signed in as</p>
            <p className="mt-1 text-sm font-semibold">{user ? user.name : "Guest explorer"}</p>
            {!user && (
              <Link href="/login" className="mt-3 inline-flex text-sm font-semibold text-gold">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!fullBleed && (
          <header className="flex items-center justify-between px-4 py-3 md:hidden">
            <Logo compact={false} />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href={user ? "/profile" : "/login"} className="text-sm font-semibold text-primary">
                {user ? user.name.split(" ")[0] : "Sign in"}
              </Link>
            </div>
          </header>
        )}
        <main className={cn("flex-1", fullBleed ? "min-h-0 overflow-hidden" : "overflow-y-auto pb-28 md:pb-8")}>
          {children}
        </main>
        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 items-end rounded-[1.7rem] border border-white/50 bg-card/90 px-1 py-2 shadow-[0_16px_40px_-20px_rgb(16_32_24/0.45)] backdrop-blur-xl md:hidden">
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
            const isActive =
              pathname === href || (href !== "/" && href !== "/agency" && pathname.startsWith(href));
            const Icon = item.icon;
            if (item.emphasize) {
              return (
                <Link
                  key={item.href}
                  href={href}
                  aria-label="Report an issue"
                  className="-mt-7 mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_24px_-8px_rgb(13_79_60/0.8)]"
                >
                  <Icon className="size-6" />
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 text-[10px] font-semibold",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("size-5 transition-transform", isActive && "scale-110")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
