import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
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