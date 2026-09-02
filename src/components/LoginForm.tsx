"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Incorrect username or password");
      }

      const next = searchParams.get("next") || "/";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      {error && (
        <div className="rounded-lg border border-lounge-bad bg-lounge-bad/10 px-4 py-3 text-sm text-lounge-bad">
          {error}
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-lounge-muted">
          Username
        </span>
        <input
          type="text"
          required
          autoFocus
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-md border border-lounge-border bg-lounge-panel px-3 py-2.5 text-sm text-lounge-text placeholder:text-lounge-muted/60 focus:border-lounge-accent focus:outline-none focus:ring-1 focus:ring-lounge-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-lounge-muted">
          Password
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-lounge-border bg-lounge-panel px-3 py-2.5 text-sm text-lounge-text placeholder:text-lounge-muted/60 focus:border-lounge-accent focus:outline-none focus:ring-1 focus:ring-lounge-accent"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-lounge-accent px-5 py-2.5 font-display font-semibold uppercase tracking-wide text-lounge-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
