
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDTO } from "@/lib/types";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/reports/latest — the most recently submitted weekly report.
export async function GET() {
  const latest = await prisma.weeklyReport.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return NextResponse.json({ error: "No reports found" }, { status: 404 });
  }

  return NextResponse.json(toDTO(latest));
}
