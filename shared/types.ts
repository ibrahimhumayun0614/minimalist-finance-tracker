export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type Currency = 'INR' | 'AED' | 'USD' | 'EUR';
export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Bills' 
  | 'Health' 
  | 'Entertainment' 
  | 'Others';
export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // ISO string
  currency: Currency;
}
export interface UserSettings {
  id: string;
  currency: Currency;
  monthlyBudget: number;
  carryForward: boolean;
  onboarded: boolean;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}