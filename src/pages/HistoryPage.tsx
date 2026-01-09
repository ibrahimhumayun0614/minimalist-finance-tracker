import React, { useState, useMemo } from 'react';
import { Search, Download, Trash2, Filter, Edit2, Plus, Calendar } from 'lucide-react';
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
      const matchesSearch = (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
                           (e.category || "").toLowerCase().includes(search.toLowerCase());
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
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api(`/api/expenses/${id}`, { method: 'DELETE' });
      removeExpense(id);
      toast.success("Expense deleted");
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };
  const handleExport = () => {
    const data = filteredExpenses.map(e => ({
      Date: format(new Date(e.date), 'yyyy-MM-dd HH:mm'),
      Description: e.description || e.category,
      Category: e.category,
      Amount: e.amount,
      Currency: e.currency
    }));
    exportToExcel(data, `fiscal_flow_expenses_${selectedMonth}_${format(new Date(), 'yyyy_MM_dd')}`);
  };
  return (
    <AppLayout title="Transaction History">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Archives</h1>
              <p className="text-muted-foreground">Historical records and period summaries.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button onClick={() => setIsAddOpen(true)} className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" /> Add New
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card p-4 rounded-xl shadow-soft border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-secondary border-none"
              />
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-secondary border-none">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Time" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All History</SelectItem>
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
              <SelectTrigger className="bg-secondary border-none">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-card rounded-xl shadow-soft overflow-hidden border">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                       No transactions found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-accent/30 transition-colors">
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {expense.description || <span className="text-muted-foreground italic font-normal">No description</span>}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-primary border">
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {settings?.currency} {expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => setEditingExpense(expense)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-rose-500" onClick={() => handleDelete(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 bg-secondary/30 border-t flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Showing {filteredExpenses.length} transactions
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Period Total:</span>
                <span className="font-bold text-lg">{settings?.currency} {totalFiltered.toLocaleString()}</span>
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