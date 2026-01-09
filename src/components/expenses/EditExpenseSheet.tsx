import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import type { Expense, ExpenseCategory } from "@shared/types";
const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Others'];
interface EditExpenseSheetProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
}
export function EditExpenseSheet({ expense, open, onClose }: EditExpenseSheetProps) {
  const updateStoreExpense = useAppStore(s => s.updateExpense);
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState<ExpenseCategory>('Others');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDescription(expense.description);
    }
  }, [expense]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    const newAmount = Number(amount);
    if (Math.abs(newAmount - expense.amount) > expense.amount * 2) {
      if (!confirm("This change is significant. Are you sure?")) return;
    }
    setLoading(true);
    try {
      const payload = {
        amount: newAmount,
        category,
        description,
      };
      const result = await api<Expense>(`/api/expenses/${expense.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      updateStoreExpense(result);
      onClose();
      toast.success("Expense updated");
    } catch (err) {
      toast.error("Failed to update expense");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
          <SheetDescription>Update your spending details.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-secondary border-none"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger className="bg-secondary border-none">
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
            <Label htmlFor="edit-desc">Description</Label>
            <Input
              id="edit-desc"
              placeholder="What was this for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-secondary border-none"
            />
          </div>
          <SheetFooter className="pt-4">
            <Button type="submit" className="w-full btn-gradient" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}