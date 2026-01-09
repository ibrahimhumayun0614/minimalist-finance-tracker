import { create } from 'zustand';
import type { Expense, UserSettings } from '@shared/types';
interface AppState {
  expenses: Expense[];
  settings: UserSettings | null;
  isAddExpenseOpen: boolean;
  isLoading: boolean;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  setSettings: (settings: UserSettings) => void;
  setIsAddExpenseOpen: (isOpen: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}
export const useAppStore = create<AppState>((set) => ({
  expenses: [],
  settings: null,
  isAddExpenseOpen: false,
  isLoading: false,
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((state) => ({ 
    expenses: [expense, ...state.expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ) 
  })),
  removeExpense: (id) => set((state) => ({
    expenses: state.expenses.filter((e) => e.id !== id)
  })),
  setSettings: (settings) => set({ settings }),
  setIsAddExpenseOpen: (isOpen) => set({ isAddExpenseOpen: isOpen }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));