"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { WeeklyReportDTO } from "@/lib/types";

export default function WeekSelector({ currentId }: { currentId: number }) {
  const router = useRouter();
  const [reports, setReports] = useState<WeeklyReportDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data: WeeklyReportDTO[]) => setReports(data))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || reports.length <= 1) return null;

  return (
    <div className="no-print flex items-center gap-2">
      <label htmlFor="week-select" className="text-xs font-semibold uppercase tracking-wide text-lounge-muted">
        Viewing week
      </label>
      <select
        id="week-select"
        value={currentId}
        onChange={(e) => router.push(`/?id=${e.target.value}`)}
        className="rounded-md border border-lounge-border bg-lounge-panel2 px-3 py-1.5 text-sm text-lounge-text focus:border-lounge-accent focus:outline-none"
      >
        {reports.map((r) => (
          <option key={r.id} value={r.id}>
            {r.weekRange}
          </option>
        ))}
      </select>
    </div>
  );
}
