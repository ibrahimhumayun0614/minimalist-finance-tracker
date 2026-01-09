import React, { useState, useMemo } from 'react';
import { Search, Download, Trash2, Filter, Edit2, Plus, Calendar, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/store';
import { format, isWithinInterval, startOfMonth, endOfMonth, parse, isValid } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditExpenseSheet } from '@/components/expenses/EditExpenseSheet';
import { exportToExcel, getAvailableMonths } from '@/lib/utils';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import type { Expense, ExpenseCategory } from '@shared/types';
const CATEGORIES: (ExpenseCategory | 'All')[] = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Others'];
export function HistoryPage() {
  const expenses = useAppStore(s => s.expenses);
  const removeExpense = useAppStore(s => s.removeExpense);
  const settings = useAppStore(s => s.settings);
  const setIsAddOpen = useAppStore(s => s.setIsAddExpenseOpen);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | 'All'>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const availableMonths = useMemo(() => getAvailableMonths(expenses ?? []), [expenses]);
  const filteredExpenses = useMemo(() => {
    const safeExpenses = expenses ?? [];
    return safeExpenses.filter(e => {
      const desc = e.description || "";
      const cat = e.category || "";
      const matchesSearch = desc.toLowerCase().includes(search.toLowerCase()) ||
                           cat.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || e.category === category;
      let matchesMonth = true;
      if (selectedMonth !== 'All') {
        try {
          const date = new Date(e.date);
          const parsedMonth = parse(selectedMonth, 'yyyy-MM', new Date());
          if (isValid(parsedMonth)) {
            const start = startOfMonth(parsedMonth);
            const end = endOfMonth(parsedMonth);
            matchesMonth = isWithinInterval(date, { start, end });
          }
        } catch {
          matchesMonth = true;
        }
      }
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [expenses, search, category, selectedMonth]);
  const totalFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [filteredExpenses]);
  const handleDelete = async (id: string) => {
    if (!window.confirm("This action will permanently delete this record. Proceed?")) return;
    try {
      await api(`/api/expenses/${id}`, { method: 'DELETE' });
      removeExpense(id);
      toast.success("Transaction deleted successfully");
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };
  const handleExport = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const data = filteredExpenses.map(e => ({
      Date: format(new Date(e.date), 'yyyy-MM-dd HH:mm'),
      Description: e.description || e.category,
      Category: e.category,
      Amount: e.amount,
      Currency: settings?.currency || 'USD'
    }));
    exportToExcel(data, `finance_report_${selectedMonth}_${format(new Date(), 'yyyy_MM_dd')}`);
    toast.success("Excel report exported");
  };
  return (
    <AppLayout title="Transaction History">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">History</h1>
              <p className="text-muted-foreground mt-1">Review and manage your complete spending history.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleExport} className="gap-2 border-border shadow-sm hover:bg-secondary">
                <Download className="h-4 w-4" /> Export Report
              </Button>
              <Button onClick={() => setIsAddOpen(true)} className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" /> Add Entry
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-card p-5 rounded-2xl shadow-soft border border-border/60">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-secondary border-none h-10 focus-visible:ring-primary/20"
              />
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-secondary border-none h-10">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Periods" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Periods</SelectItem>
                {availableMonths.map(month => {
                  const d = parse(month, 'yyyy-MM', new Date());
                  return (
                    <SelectItem key={month} value={month}>
                      {isValid(d) ? format(d, 'MMMM yyyy') : month}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory | 'All')}>
              <SelectTrigger className="bg-secondary border-none h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-card rounded-2xl shadow-soft overflow-hidden border border-border/60">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[140px] font-bold text-foreground/80 uppercase tracking-widest text-[10px]">Date</TableHead>
                    <TableHead className="font-bold text-foreground/80 uppercase tracking-widest text-[10px]">Description</TableHead>
                    <TableHead className="hidden md:table-cell font-bold text-foreground/80 uppercase tracking-widest text-[10px]">Category</TableHead>
                    <TableHead className="text-right font-bold text-foreground/80 uppercase tracking-widest text-[10px]">Amount</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50">
                          <AlertCircle className="h-10 w-10 mb-2" />
                          <p className="font-medium">No results found</p>
                          <p className="text-xs">Adjust your search or filters to see more results</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-accent/30 transition-colors group">
                        <TableCell className="text-xs font-semibold text-muted-foreground">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="font-bold text-foreground/90">
                          {expense.description || <span className="text-muted-foreground/40 italic font-normal text-xs uppercase tracking-tighter">Unnamed Entry</span>}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-secondary text-primary border border-border/40">
                            {expense.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-rose-500">
                          {settings?.currency || 'USD'} {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingExpense(expense)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(expense.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-5 bg-secondary/20 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
              <span className="text-muted-foreground font-medium">
                {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''} listed
              </span>
              <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-xl border border-border/50 shadow-sm">
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Total Spent:</span>
                <span className="font-black text-xl text-primary">{settings?.currency || 'USD'} {totalFiltered.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditExpenseSheet expense={editingExpense} open={!!editingExpense} onClose={() => setEditingExpense(null)} />
    </AppLayout>
  );
}
export default HistoryPage;