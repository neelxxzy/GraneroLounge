export type StockStatus = 'green' | 'amber' | 'red';

export interface WeeklyReportDTO {
  id: string;
  weekRange: string;
  weekStart?: string | null;
  totalSales: number;
  previousYearSales: number;
  foodStockResult: number;
  foodStockThreshold: number;
  drinkStockResult: number;
  drinkStockThreshold: number;
  bohFocus: string[];
  fohFocus: string[];
  dotw: string;
  botw: string;
  createdAt: string;
  updatedAt: string;
}

// Payload shape accepted by the create/update API routes.
export type WeeklyReportInput = {
  weekRange: string;
  weekStart?: string | null; // ISO date string, e.g. "2026-08-10"
  totalSales: number;
  previousYearSales: number;
  foodStockResult: number;
  foodStockThreshold: number;
  drinkStockResult: number;
  drinkStockThreshold: number;
  bohFocus: string[];
  fohFocus: string[];
  dotw: string;
  botw: string;
};

// Helper function to serialize database records to DTO format
export function toDTO(report: any): WeeklyReportDTO {
  return {
    ...report,
    bohFocus: typeof report.bohFocus === 'string' ? JSON.parse(report.bohFocus) : report.bohFocus || [],
    fohFocus: typeof report.fohFocus === 'string' ? JSON.parse(report.fohFocus) : report.fohFocus || [],
    createdAt: report.createdAt ? new Date(report.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: report.updatedAt ? new Date(report.updatedAt).toISOString() : new Date().toISOString(),
  };
}