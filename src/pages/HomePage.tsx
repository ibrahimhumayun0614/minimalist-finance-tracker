import React, { useEffect, useMemo } from 'react';
import { Plus, Wallet, TrendingUp, CreditCard, Clock, ArrowDownCircle, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MetricsCard } from '@/components/ui/extension/metrics-card';
import { OverviewCharts } from '@/components/dashboard/OverviewCharts';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { format, startOfMonth, subMonths, endOfMonth, isWithinInterval } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { calculateSavings } from '@/lib/utils';
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
  const { totalSpent, effectiveBudget, remaining, spentPercent, dailyAverage, carriedBalance, currentMonthExpenses } = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const filtered = expenses.filter(e => new Date(e.date) >= currentMonthStart);
    const spent = filtered.reduce((sum, e) => sum + e.amount, 0);
    const baseBudget = settings?.monthlyBudget ?? 0;
    let carried = 0;
    if (settings?.carryForward) {
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));
      const prevMonthExpenses = expenses.filter(e =>
        isWithinInterval(new Date(e.date), { start: prevMonthStart, end: prevMonthEnd })
      );
      carried = calculateSavings(prevMonthExpenses, baseBudget);
    }
    const effective = baseBudget + carried;
    const rem = Math.max(0, effective - spent);
    const pct = effective > 0 ? Math.round((spent / effective) * 100) : 0;
    const dayOfMonth = Number(format(now, 'dd'));
    const avg = dayOfMonth > 0 ? Math.round(spent / dayOfMonth) : 0;
    return {
      totalSpent: spent,
      effectiveBudget: effective,
      remaining: rem,
      spentPercent: pct,
      dailyAverage: avg,
      carriedBalance: carried,
      currentMonthExpenses: filtered
    };
  }, [expenses, settings]);
  return (
    <AppLayout title="Overview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8 md:py-10 lg:py-12 space-y-8"
        >
          <OnboardingWizard />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Health</h1>
              <p className="text-muted-foreground">Monitoring your budget for {format(new Date(), 'MMMM yyyy')}.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="btn-gradient shadow-primary">
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard title="Effective Budget" value={effectiveBudget} currency={settings?.currency} icon={<Wallet className="h-4 w-4" />} />
            <MetricsCard title="Total Spent" value={totalSpent} currency={settings?.currency} icon={<CreditCard className="h-4 w-4" />} trend={{ value: spentPercent, label: "of budget", isPositive: totalSpent <= effectiveBudget }} />
            <MetricsCard title="Balance Left" value={remaining} currency={settings?.currency} icon={<TrendingUp className="h-4 w-4" />} />
            <MetricsCard title="Daily Average" value={dailyAverage} currency={settings?.currency} icon={<Clock className="h-4 w-4" />} />
          </div>
          <AnimatePresence>
            {settings?.carryForward && carriedBalance > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/50"
              >
                <ArrowDownCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">
                  Excellent work! {settings.currency} {carriedBalance.toLocaleString()} carried forward from last month.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <OverviewCharts expenses={currentMonthExpenses} />
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-soft space-y-4 border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
                <Button variant="ghost" size="sm" asChild className="text-xs hover:bg-accent">
                  <Link to="/history">View All</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {currentMonthExpenses.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                    <div className="p-4 bg-secondary rounded-full mb-3 opacity-50">
                      <Receipt className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium">No transactions this month</p>
                    <p className="text-xs opacity-60">Your spending history will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentMonthExpenses.slice(0, 6).map((expense, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={expense.id}
                        className="flex items-center justify-between group p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-primary">
                            {expense.category[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                              {expense.description || expense.category}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{format(new Date(expense.date), 'MMM d, h:mm a')}</p>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          -{settings?.currency} {expense.amount.toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}