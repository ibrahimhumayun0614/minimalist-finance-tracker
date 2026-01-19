import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Wallet, TrendingUp, CreditCard, Clock, Receipt, X, Sparkles, Edit2, Check, RotateCcw, ArrowRightLeft } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Expense, UserSettings } from '@shared/types';
export function HomePage() {
  const expenses = useAppStore(s => s.expenses);
  const setExpenses = useAppStore(s => s.setExpenses);
  const settings = useAppStore(s => s.settings);
  const setSettings = useAppStore(s => s.setSettings);
  const setIsAddOpen = useAppStore(s => s.setIsAddExpenseOpen);
  const [showMonthResetBanner, setShowMonthResetBanner] = useState(false);
  const [isEditingCarry, setIsEditingCarry] = useState(false);
  const [manualValue, setManualValue] = useState('');
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
  const handleUpdateManualCarry = async () => {
    const val = parseFloat(manualValue);
    if (isNaN(val)) {
      toast.error("Invalid amount entered");
      return;
    }
    try {
      const updated = await api<UserSettings>('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ manualCarryForward: val })
      });
      setSettings(updated);
      setIsEditingCarry(false);
      toast.success("Balance adjustment saved");
    } catch (e) {
      toast.error("Failed to save adjustment");
    }
  };
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const safeExpenses = expenses ?? [];
    const filtered = safeExpenses.filter(e => {
      try {
        const d = new Date(e.date);
        return isWithinInterval(d, { start: currentMonthStart, end: currentMonthEnd });
      } catch {
        return false;
      }
    });
    const spent = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);
    const baseBudget = settings?.monthlyBudget ?? 0;
    const currency = settings?.currency ?? 'USD';
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));
    const prevMonthExpenses = safeExpenses.filter(e => {
      try {
        return isWithinInterval(new Date(e.date), { start: prevMonthStart, end: prevMonthEnd });
      } catch {
        return false;
      }
    });
    const autoCarried = calculateSavings(prevMonthExpenses, baseBudget);
    const manualOverride = settings?.manualCarryForward ?? 0;
    const carriedBalance = manualOverride !== 0 ? manualOverride : autoCarried;
    const isOverridden = manualOverride !== 0;
    const rem = Math.max(0, baseBudget - spent);
    const pct = baseBudget > 0 ? Math.round((spent / baseBudget) * 100) : 0;
    const dayOfMonth = now.getDate();
    const avg = dayOfMonth > 0 ? Math.round(spent / dayOfMonth) : 0;
    return {
      totalSpent: spent,
      baseBudget,
      remaining: rem,
      spentPercent: pct,
      dailyAverage: avg,
      carriedBalance,
      isOverridden,
      currentMonthExpenses: filtered,
      currency
    };
  }, [expenses, settings]);
  return (
    <AppLayout title="Financial Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <OnboardingWizard />
          {showMonthResetBanner && (
            <div className="mb-6">
              <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-200/50">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Fresh Monthly Start</h4>
                    <p className="text-sm text-emerald-50">Expenses reset for {format(new Date(), 'MMMM')}. Check your carried balance below.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleDismissBanner} className="text-white hover:bg-white/10 shrink-0">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
              <p className="text-muted-foreground">{format(new Date(), 'MMMM yyyy')} Snapshot</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="btn-gradient px-6">
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            <MetricsCard
              title="Target Budget"
              value={metrics.baseBudget}
              currency={metrics.currency}
              icon={<Wallet className="h-4 w-4" />}
            />
            <MetricsCard
              title="Carried Over"
              value={metrics.carriedBalance}
              currency={metrics.currency}
              icon={<ArrowRightLeft className="h-4 w-4" />}
              trend={metrics.isOverridden ? { value: 0, label: "Adjusted", isPositive: true } : undefined}
            />
            <MetricsCard
              title="Budget Left"
              value={metrics.remaining}
              currency={metrics.currency}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <MetricsCard
              title="Month Total"
              value={metrics.totalSpent}
              currency={metrics.currency}
              icon={<CreditCard className="h-4 w-4" />}
              trend={{ value: metrics.spentPercent, label: "used", isPositive: metrics.totalSpent <= metrics.baseBudget }}
            />
            <MetricsCard
              title="Daily Average"
              value={metrics.dailyAverage}
              currency={metrics.currency}
              icon={<Clock className="h-4 w-4" />}
            />
          </div>
          {settings?.carryForward && (metrics.carriedBalance > 0 || metrics.isOverridden) && (
            <div className="flex flex-wrap items-center justify-between p-4 bg-primary/5 text-primary rounded-xl border border-primary/10 gap-4 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full hidden sm:flex items-center justify-center">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {metrics.carriedBalance > 0
                      ? `Available savings: ${metrics.currency} ${metrics.carriedBalance.toLocaleString()} carried forward.`
                      : `Carry-forward logic is active.`
                    }
                    {metrics.isOverridden && (
                      <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight">Manual Override</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditingCarry ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs gap-1.5 hover:bg-primary/10"
                    onClick={() => {
                      setManualValue(metrics.carriedBalance.toString());
                      setIsEditingCarry(true);
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Adjust Balance
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                    <Input
                      type="number"
                      value={manualValue}
                      onChange={e => setManualValue(e.target.value)}
                      className="h-9 w-28 bg-background text-sm font-medium"
                      autoFocus
                    />
                    <Button size="icon" className="h-9 w-9" onClick={handleUpdateManualCarry}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setIsEditingCarry(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    {metrics.isOverridden && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 text-rose-500 border-rose-200 hover:bg-rose-50"
                        title="Revert to auto-calculate"
                        onClick={async () => {
                          try {
                            const updated = await api<UserSettings>('/api/settings', {
                              method: 'POST',
                              body: JSON.stringify({ manualCarryForward: 0 })
                            });
                            setSettings(updated);
                            setIsEditingCarry(false);
                            toast.success("Resumed automatic tracking");
                          } catch (e) {
                            toast.error("Revert failed");
                          }
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <OverviewCharts expenses={metrics.currentMonthExpenses} />
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-soft space-y-5 border border-border/60">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg tracking-tight">Recent Activity</h3>
                <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-primary">
                  <Link to="/history">View History</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {metrics.currentMonthExpenses.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
                    <div className="p-4 bg-secondary rounded-2xl mb-4 opacity-40">
                      <Receipt className="h-10 w-10" />
                    </div>
                    <p className="text-sm font-semibold">No recent transactions</p>
                    <p className="text-xs opacity-70">Add an expense to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics.currentMonthExpenses.slice(0, 6).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/40 transition-all border border-transparent hover:border-border">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {expense.category[0]}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate leading-none mb-1.5">
                              {expense.description || expense.category}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                              {format(new Date(expense.date), 'MMM d • h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-rose-500 whitespace-nowrap ml-4">
                          -{metrics.currency}{expense.amount.toLocaleString()}
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