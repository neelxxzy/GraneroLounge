import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDTO, type WeeklyReportInput } from "@/lib/types";

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/reports/:id — fetch a single weekly report (used by the dashboard
// week selector to load a specific past week).
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  const report = await prisma.weeklyReport.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(toDTO(report));
}

// PUT /api/reports/:id — update an existing weekly report.
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  let body: WeeklyReportInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const updated = await prisma.weeklyReport.update({
      where: { id },
      data: {
        weekRange: body.weekRange?.trim(),
        weekStart: body.weekStart !== undefined ? (body.weekStart ? new Date(body.weekStart) : null) : undefined,
        totalSales: body.totalSales,
        previousYearSales: body.previousYearSales,
        lflTargetPercent: body.lflTargetPercent,
        foodStockResult: body.foodStockResult,
        foodStockThreshold: body.foodStockThreshold,
        drinkStockResult: body.drinkStockResult,
        drinkStockThreshold: body.drinkStockThreshold,
        npsScore: body.npsScore !== undefined ? Math.round(body.npsScore) : undefined,
        foodQualityScore: body.foodQualityScore,
        drinkQualityScore: body.drinkQualityScore,
        needToKnow: body.needToKnow?.trim(),
        dotw: body.dotw?.trim(),
        botw: body.botw?.trim(),
        bohFocus: body.bohFocus ? JSON.stringify(body.bohFocus.filter((s) => s.trim())) : undefined,
        fohFocus: body.fohFocus ? JSON.stringify(body.fohFocus.filter((s) => s.trim())) : undefined,
      },
    });
    return NextResponse.json(toDTO(updated));
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}

// DELETE /api/reports/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  try {
    await prisma.weeklyReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}
