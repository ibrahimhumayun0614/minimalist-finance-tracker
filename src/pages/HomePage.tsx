import React, { useEffect } from 'react';
import { Plus, Wallet, TrendingUp, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricsCard } from '@/components/ui/extension/metrics-card';
import { OverviewCharts } from '@/components/dashboard/OverviewCharts';
import { AddExpenseSheet } from '@/components/expenses/AddExpenseSheet';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { format } from 'date-fns';
import type { Expense, UserSettings } from '@shared/types';
export function HomePage() {
  const expenses = useAppStore(s => s.expenses);
  const setExpenses = useAppStore(s => s.setExpenses);
  const settings = useAppStore(s => s.settings);
  const setSettings = useAppStore(s => s.setSettings);
  const setIsAddOpen = useAppStore(s => s.setIsAddExpenseOpen);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, expensesPage] = await Promise.all([
          api<UserSettings>('/api/settings'),
          api<{ items: Expense[] }>('/api/expenses')
        ]);
        setSettings(settingsData);
        setExpenses(expensesPage.items);
      } catch (err) {
        console.error("Dashboard failed to load", err);
      }
    };
    fetchData();
  }, [setSettings, setExpenses]);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = settings?.monthlyBudget ?? 0;
  const remaining = Math.max(0, budget - totalSpent);
  const spentPercent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background transition-colors duration-300">
      <ThemeToggle />
      <OnboardingWizard />
      <AddExpenseSheet />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Health</h1>
              <p className="text-muted-foreground">Monitoring your budget for {format(new Date(), 'MMMM yyyy')}.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="btn-gradient shadow-primary">
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </div>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard 
              title="Monthly Budget" 
              value={budget} 
              currency={settings?.currency} 
              icon={<Wallet className="h-4 w-4" />}
            />
            <MetricsCard 
              title="Total Spent" 
              value={totalSpent} 
              currency={settings?.currency} 
              icon={<CreditCard className="h-4 w-4" />}
              trend={{ value: spentPercent, label: "of budget", isPositive: totalSpent <= budget }}
            />
            <MetricsCard 
              title="Remaining" 
              value={remaining} 
              currency={settings?.currency} 
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <MetricsCard 
              title="Daily Average" 
              value={Math.round(totalSpent / format(new Date(), 'dd') as any)} 
              currency={settings?.currency} 
              icon={<Clock className="h-4 w-4" />}
            />
          </div>
          {/* Analytics Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <OverviewCharts expenses={expenses} />
            </div>
            {/* Recent Transactions Mini-list */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent Activity</h3>
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </div>
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="text-sm">No expenses yet this month.</p>
                  </div>
                ) : (
                  expenses.slice(0, 6).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                          {expense.category[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{expense.description || expense.category}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'MMM d, h:mm a')}</p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        -{settings?.currency} {expense.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
}