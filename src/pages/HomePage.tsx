import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Wallet, TrendingUp, CreditCard, Clock, ArrowDownCircle, Receipt, X, Sparkles } from 'lucide-react';
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
  const [showMonthResetBanner, setShowMonthResetBanner] = useState(false);
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [settingsData, expensesPage] = await Promise.all([
          api<UserSettings>('/api/settings'),
          api<{ items: Expense[] }>('/api/expenses')
        ]);
        if (!mounted) return;
        setSettings(settingsData);
        setExpenses(expensesPage.items ?? []);
        const currentMonthKey = format(new Date(), 'yyyy-MM');
        if (settingsData.onboarded && settingsData.lastViewedMonth && settingsData.lastViewedMonth !== currentMonthKey) {
          setShowMonthResetBanner(true);
        }
      } catch (err) {
        console.error("Dashboard failed to load", err instanceof Error ? err.message : err);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [setSettings, setExpenses]);
  const handleDismissBanner = async () => {
    setShowMonthResetBanner(false);
    const currentMonthKey = format(new Date(), 'yyyy-MM');
    try {
      const updated = await api<UserSettings>('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ lastViewedMonth: currentMonthKey })
      });
      setSettings(updated);
    } catch (e) {
      console.error("Failed to update last viewed month", e);
    }
  };
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const safeExpenses = expenses ?? [];
    const filtered = safeExpenses.filter(e => {
      try {
        return isWithinInterval(new Date(e.date), { start: currentMonthStart, end: currentMonthEnd });
      } catch {
        return false;
      }
    });
    const spent = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);
    const baseBudget = settings?.monthlyBudget ?? 0;
    let carried = 0;
    if (settings?.carryForward) {
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));
      const prevMonthExpenses = safeExpenses.filter(e => {
        try {
          return isWithinInterval(new Date(e.date), { start: prevMonthStart, end: prevMonthEnd });
        } catch {
          return false;
        }
      });
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
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <OnboardingWizard />
          <AnimatePresence>
            {showMonthResetBanner && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-200/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">New Month Started!</h4>
                      <p className="text-sm text-emerald-50">Your active spending dashboard has been reset for {format(new Date(), 'MMMM')}.</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleDismissBanner} className="text-white hover:bg-white/10">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Health</h1>
              <p className="text-muted-foreground">Monitoring your budget for {format(new Date(), 'MMMM yyyy')}.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard title="Effective Budget" value={metrics.effectiveBudget} currency={settings?.currency} icon={<Wallet className="h-4 w-4" />} />
            <MetricsCard title="Total Spent" value={metrics.totalSpent} currency={settings?.currency} icon={<CreditCard className="h-4 w-4" />} trend={{ value: metrics.spentPercent, label: "of budget", isPositive: metrics.totalSpent <= metrics.effectiveBudget }} />
            <MetricsCard title="Balance Left" value={metrics.remaining} currency={settings?.currency} icon={<TrendingUp className="h-4 w-4" />} />
            <MetricsCard title="Daily Average" value={metrics.dailyAverage} currency={settings?.currency} icon={<Clock className="h-4 w-4" />} />
          </div>
          <AnimatePresence>
            {settings?.carryForward && metrics.carriedBalance > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-4 bg-primary/5 text-primary rounded-xl border border-primary/10"
              >
                <ArrowDownCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">
                  Excellent work! {settings.currency} {metrics.carriedBalance.toLocaleString()} carried forward from last month.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <OverviewCharts expenses={metrics.currentMonthExpenses} />
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4 border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Current Month Activity</h3>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link to="/history">View Archive</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {metrics.currentMonthExpenses.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                    <div className="p-4 bg-secondary rounded-full mb-3 opacity-50">
                      <Receipt className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium">No transactions this month</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {metrics.currentMonthExpenses.slice(0, 6).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-primary">
                            {expense.category[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[120px]">
                              {expense.description || expense.category}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{format(new Date(expense.date), 'MMM d, h:mm a')}</p>
                          </div>
                        </div>
                        <div className="text-sm font-bold">
                          -{settings?.currency} {expense.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}