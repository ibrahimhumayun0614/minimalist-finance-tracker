import React, { useState, useMemo } from 'react';
import { Search, Download, Trash2, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToExcel } from '@/lib/utils';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import type { ExpenseCategory } from '@shared/types';
const CATEGORIES: (ExpenseCategory | 'All')[] = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Others'];
export default function HistoryPage() {
  const expenses = useAppStore(s => s.expenses);
  const removeExpense = useAppStore(s => s.removeExpense);
  const settings = useAppStore(s => s.settings);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | 'All'>('All');
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) || 
                           e.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || e.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, category]);
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
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
    exportToExcel(data, `expenses_${format(new Date(), 'yyyy_MM_dd')}`);
  };
  return (
    <AppLayout title="Transaction History">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Expense History</h1>
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export to Excel
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-card p-4 rounded-xl shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search description..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory | 'All')}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="bg-white dark:bg-card rounded-xl shadow-sm overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
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
                  <TableRow key={expense.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {expense.description || "—"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary">
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {settings?.currency} {expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}