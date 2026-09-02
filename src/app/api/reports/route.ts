export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDTO, type WeeklyReportInput } from "@/lib/types";

// GET /api/reports — list all reports, most recent first.
// Used by the week selector on the dashboard.
export async function GET() {
  const reports = await prisma.weeklyReport.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reports.map(toDTO));
}

// POST /api/reports — create a new weekly report from the admin form.
export async function POST(request: NextRequest) {
  let body: WeeklyReportInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const created = await prisma.weeklyReport.create({
    data: {
      weekRange: body.weekRange.trim(),
      weekStart: body.weekStart ? new Date(body.weekStart) : null,
      totalSales: body.totalSales,
      previousYearSales: body.previousYearSales,
      lflTargetPercent: body.lflTargetPercent,
      foodStockResult: body.foodStockResult,
      foodStockThreshold: body.foodStockThreshold,
      drinkStockResult: body.drinkStockResult,
      drinkStockThreshold: body.drinkStockThreshold,
      npsScore: Math.round(body.npsScore),
      foodQualityScore: body.foodQualityScore,
      drinkQualityScore: body.drinkQualityScore,
      needToKnow: body.needToKnow.trim(),
      dotw: body.dotw.trim(),
      botw: body.botw.trim(),
      bohFocus: JSON.stringify(body.bohFocus.filter((s) => s.trim().length > 0)),
      fohFocus: JSON.stringify(body.fohFocus.filter((s) => s.trim().length > 0)),
    },
  });

  return NextResponse.json(toDTO(created), { status: 201 });
}

function validate(body: Partial<WeeklyReportInput>): string | null {
  if (!body.weekRange || !body.weekRange.trim()) return "weekRange is required";
  if (typeof body.totalSales !== "number" || Number.isNaN(body.totalSales))
    return "totalSales must be a number";
  if (typeof body.previousYearSales !== "number" || Number.isNaN(body.previousYearSales))
    return "previousYearSales must be a number";
  if (typeof body.lflTargetPercent !== "number") return "lflTargetPercent must be a number";
  if (typeof body.foodStockResult !== "number") return "foodStockResult must be a number";
  if (typeof body.drinkStockResult !== "number") return "drinkStockResult must be a number";
  if (typeof body.npsScore !== "number") return "npsScore must be a number";
  if (body.npsScore < 0 || body.npsScore > 100) return "npsScore must be between 0 and 100";
  if (typeof body.foodQualityScore !== "number") return "foodQualityScore must be a number";
  if (body.foodQualityScore < 0 || body.foodQualityScore > 5)
    return "foodQualityScore must be between 0 and 5";
  if (typeof body.drinkQualityScore !== "number") return "drinkQualityScore must be a number";
  if (body.drinkQualityScore < 0 || body.drinkQualityScore > 5)
    return "drinkQualityScore must be between 0 and 5";
  if (!body.dotw || !body.dotw.trim()) return "dotw is required";
  if (!body.botw || !body.botw.trim()) return "botw is required";
  if (!Array.isArray(body.bohFocus)) return "bohFocus must be an array of strings";
  if (!Array.isArray(body.fohFocus)) return "fohFocus must be an array of strings";
  return null;
}
