"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AREAS } from "@/data/areas";
import { Logo } from "@/components/brand/Logo";
import { useCivicStore } from "@/lib/store";

export function RegisterPage() {
  const router = useRouter();
  const register = useCivicStore((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [area, setArea] = useState("East Legon");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Logo />
      <h1 className="mt-6 font-heading text-3xl font-extrabold">Create a CivicGH account</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Your phone number and email stay private. The public map shows the problem, not you.
      </p>
      <form
        className="card-lift mt-6 grid gap-4 rounded-[1.7rem] bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const err = register(name, email, password, area);
          if (err) {
            toast.error(err);
            return;
          }
          toast.success("Account created.");
          router.push("/");
        }}
      >
        <label className="grid gap-1.5 text-sm font-semibold">
          Full name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-2xl bg-secondary px-4 text-sm outline-none"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-2xl bg-secondary px-4 text-sm outline-none"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-2xl bg-secondary px-4 text-sm outline-none"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          Home area
          <select className="h-12 rounded-2xl bg-secondary px-3 text-sm" value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-12 rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
          Register
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already registered?{" "}
        <Link href="/login" className="font-bold text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
