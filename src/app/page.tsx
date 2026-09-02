export const dynamic = 'force-dynamic';
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toDTO } from "@/lib/types";
import Dashboard from "@/components/Dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams.id ? Number(searchParams.id) : undefined;

  const report =
    id && Number.isInteger(id)
      ? await prisma.weeklyReport.findUnique({ where: { id } })
      : await prisma.weeklyReport.findFirst({ orderBy: { createdAt: "desc" } });

  if (!report) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-lounge-border bg-lounge-panel p-10 text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-lounge-accent">
          No Weekly Reports Yet
        </h1>
        <p className="mt-3 text-lounge-muted">
          Submit this week&apos;s stock and sales figures to generate the notice board.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block rounded-lg bg-lounge-accent px-5 py-2.5 font-display font-semibold uppercase tracking-wide text-lounge-bg transition hover:brightness-110"
        >
          + New Weekly Report
        </Link>
      </div>
    );
  }

  return <Dashboard report={toDTO(report)} />;
}
