import { StockStatus } from './types';

/**
 * Live-preview / dashboard calculations shared between the input form
 * and the notice board view, so the numbers are always computed the
 * same way in one place.
 */

export function salesDifference(totalSales: number, previousYearSales: number): number {
  return totalSales - previousYearSales;
}

export function actualLflPercent(totalSales: number, previousYearSales: number): number {
  if (!previousYearSales) return 0;
  return ((totalSales - previousYearSales) / previousYearSales) * 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Currency string with an explicit leading + for positive values, e.g. "+£5,632" */
export function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function getStockStatus(value: number, category: 'food' | 'drink'): StockStatus {
  // Use absolute value to evaluate +/- variance equally
  const absVal = Math.abs(value);

  if (category === 'food') {
    // Green: Within ±1.0%
    if (absVal <= 1.0) return 'green';
    // Amber: Between ±1.0% and ±1.5%
    if (absVal <= 1.5) return 'amber';
    // Red: Greater than ±1.5%
    return 'red';
  } else {
    // Green: Within ±0.6%
    if (absVal <= 0.6) return 'green';
    // Amber: Between ±0.6% and ±0.85%
    if (absVal <= 0.85) return 'amber';
    // Red: Greater than ±0.85%
    return 'red';
  }
}

/**
 * Week-range auto-fill helpers, so a shift manager doesn't have to type
 * "10th - 16th August 2026" by hand every Monday.
 */

function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** Returns the Monday on/after `from` (defaults to today), at midnight local time. */
export function getNextMonday(from: Date = new Date()): Date {
  const date = new Date(from);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 = Sun ... 6 = Sat, 1 = Mon
  const daysUntilMonday = (8 - day) % 7; // 0 if already Monday
  date.setDate(date.getDate() + daysUntilMonday);
  return date;
}

/** Formats a Monday-start date into "10th - 16th August 2026" (or "29th July - 4th August 2026" across month). */
export function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDay = ordinal(monday.getDate());
  const endDay = ordinal(sunday.getDate());
  const startMonth = monday.toLocaleString("en-GB", { month: "long" });
  const endMonth = sunday.toLocaleString("en-GB", { month: "long" });
  const year = sunday.getFullYear();

  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${endMonth} ${year}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
}

/** yyyy-mm-dd for populating a <input type="date"> value. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}