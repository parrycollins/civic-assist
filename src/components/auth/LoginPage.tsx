"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { useCivicStore } from "@/lib/store";

export function LoginPage() {
  const router = useRouter();
  const login = useCivicStore((s) => s.login);
  const [email, setEmail] = useState("ama@civicgh.gh");
  const [password, setPassword] = useState("civic2026");

  function submit(nextEmail = email, nextPassword = password) {
    const err = login(nextEmail, nextPassword);
    if (err) {
      toast.error(err);
      return;
    }
    const user = useCivicStore.getState().user;
    toast.success(`Welcome${user ? `, ${user.name}` : ""}`);
    router.push(user?.role === "agency" ? "/agency" : "/");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Logo />
      <h1 className="mt-6 font-heading text-3xl font-extrabold">Sign in</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Citizens and agency officers share the same map. Public reports never show private contact details.
      </p>
      <form
        className="card-lift mt-6 grid gap-4 rounded-[1.7rem] bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="grid gap-1.5 text-sm font-semibold" htmlFor="email">
          Email
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-2xl bg-secondary px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold" htmlFor="password">
          Password
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-2xl bg-secondary px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <button
          type="submit"
          className="h-12 rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
        >
          Continue
        </button>
      </form>
      <p className="mt-4 text-sm">
        New here?{" "}
        <Link href="/register" className="font-bold text-primary">
          Create a citizen account
        </Link>
      </p>
      <div className="card-lift mt-6 rounded-[1.5rem] bg-card p-4 text-sm">
        <p className="font-heading font-bold">Demo accounts</p>
        <ul className="mt-2 space-y-2">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email}>
              <button
                type="button"
                className="w-full rounded-2xl bg-secondary px-3 py-2 text-left text-xs font-medium"
                onClick={() => {
                  setEmail(a.email);
                  setPassword(a.password);
                  submit(a.email, a.password);
                }}
              >
                {a.role === "citizen" ? "Citizen" : "Agency"} — {a.email} / {a.password}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
