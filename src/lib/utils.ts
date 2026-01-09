import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';
import { subMonths, startOfMonth, endOfMonth, format, isSameMonth } from 'date-fns';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
export function getPreviousMonthRange() {
  const prev = subMonths(new Date(), 1);
  return {
    start: startOfMonth(prev),
    end: endOfMonth(prev)
  };
}
export function calculateSavings(expenses: { amount: number }[], budget: number) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return Math.max(0, budget - total);
}
/**
 * Returns a unique list of YYYY-MM strings from a list of expenses,
 * sorted from newest to oldest.
 */
export function getAvailableMonths(expenses: { date: string }[]): string[] {
  const months = new Set<string>();
  expenses.forEach(e => {
    const monthKey = format(new Date(e.date), 'yyyy-MM');
    months.add(monthKey);
  });
  // Also ensure current month is always available even if empty
  months.add(format(new Date(), 'yyyy-MM'));
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}
/**
 * Checks if two dates fall in different calendar months
 */
export function isNewMonth(date1: Date, date2: Date): boolean {
  return !isSameMonth(date1, date2);
}