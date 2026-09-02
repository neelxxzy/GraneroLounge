"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // The login page has its own minimal layout — no nav bar there.
  if (pathname === "/login") return null;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <nav className="no-print sticky top-0 z-50 border-b border-lounge-border bg-lounge-panel/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-lounge-accent" />
          Granero Dashboard
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-lounge-muted transition hover:bg-lounge-panel2 hover:text-lounge-text"
          >
            Notice Board
          </Link>
          <Link
            href="/admin"
            className="rounded-md bg-lounge-accent px-3 py-1.5 font-semibold text-lounge-bg transition hover:brightness-110"
          >
            + New Weekly Report
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-md border border-lounge-border px-3 py-1.5 text-lounge-muted transition hover:border-lounge-bad hover:text-lounge-bad disabled:opacity-60"
          >
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </nav>
  );
}
