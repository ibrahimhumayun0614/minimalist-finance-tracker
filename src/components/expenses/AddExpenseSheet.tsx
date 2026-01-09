import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/sheet"; // Actually from @/components/ui/button
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import type { Expense, ExpenseCategory } from "@shared/types";
const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Others'];
export function AddExpenseSheet() {
  const isOpen = useAppStore(s => s.isAddExpenseOpen);
  const setIsOpen = useAppStore(s => s.setIsAddExpenseOpen);
  const addExpenseStore = useAppStore(s => s.addExpense);
  const settings = useAppStore(s => s.settings);
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState<ExpenseCategory>('Others');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        amount: Number(amount),
        category,
        description,
        date: new Date().toISOString(),
        currency: settings?.currency || 'USD'
      };
      const result = await api<Expense>('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      addExpenseStore(result);
      setIsOpen(false);
      setAmount('');
      setDescription('');
      toast.success("Expense added successfully");
    } catch (err) {
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Expense</SheetTitle>
          <SheetDescription>Track your spending habits instantly.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-secondary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger className="bg-secondary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Input 
              id="desc" 
              placeholder="What was this for?" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-secondary"
            />
          </div>
          <SheetFooter className="pt-4">
            <Button type="submit" className="w-full btn-gradient" disabled={loading}>
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}