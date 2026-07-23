"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// The credential form. Posts to /api/auth/login, then navigates into the app. The two demo accounts
// can be filled with one click — a convenience for reviewing the app, not part of the auth flow.
const DEMO = [
  { label: "Alice at Acme", email: "alice@acme.io" },
  { label: "Bob at Rival", email: "bob@rival.io" },
];

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-ink-2">
          Work email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted shadow-sm transition-colors focus:border-brand"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-ink-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted shadow-sm transition-colors focus:border-brand"
        />
      </div>

      {error && (
        <p className="rounded-md bg-weak-wash px-3 py-2 text-sm text-weak ring-1 ring-weak/20">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-ink disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <div className="pt-2">
        <p className="mb-2 text-center text-xs text-muted">Demo accounts — password is “password”</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword("password");
              }}
              className="rounded-md border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-2 transition-colors hover:border-brand hover:text-brand-ink"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
