"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { useCivicStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const router = useRouter();
  const login = useCivicStore((s) => s.login);
  const [email, setEmail] = useState("ama@civicgh.gh");
  const [password, setPassword] = useState("civic2026");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <p className="font-heading text-2xl font-semibold">CivicGH</p>
      <h1 className="mt-2 text-xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Citizens and agency officers share the same map. Public reports never show private contact details.
      </p>
      <form
        className="mt-6 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const err = login(email, password);
          if (err) {
            toast.error(err);
            return;
          }
          const user = useCivicStore.getState().user;
          toast.success(`Welcome${user ? `, ${user.name}` : ""}`);
          router.push(user?.role === "agency" ? "/agency" : "/");
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" size="lg">
          Continue
        </Button>
      </form>
      <p className="mt-4 text-sm">
        New here?{" "}
        <Link href="/register" className="font-medium text-primary">
          Create a citizen account
        </Link>
      </p>
      <div className="mt-6 rounded-xl border p-3 text-xs">
        <p className="font-semibold">Demo accounts</p>
        <ul className="mt-1 space-y-1">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email}>
              <button
                type="button"
                className="text-left hover:underline"
                onClick={() => {
                  setEmail(a.email);
                  setPassword(a.password);
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
