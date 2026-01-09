import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Save, Wallet, ShieldCheck, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Currency, UserSettings } from '@shared/types';
export function SettingsPage() {
  const settings = useAppStore(s => s.settings);
  const setSettings = useAppStore(s => s.setSettings);
  const setExpenses = useAppStore(s => s.setExpenses);
  const [budget, setBudget] = useState(settings?.monthlyBudget.toString() || '');
  const [currency, setCurrency] = useState<Currency>(settings?.currency || 'USD');
  const [carryForward, setCarryForward] = useState(settings?.carryForward || false);
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    setLoading(true);
    try {
      const updated: Partial<UserSettings> = {
        monthlyBudget: Number(budget),
        currency,
        carryForward
      };
      const result = await api<UserSettings>('/api/settings', {
        method: 'POST',
        body: JSON.stringify(updated)
      });
      setSettings(result);
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };
  const handleClearHistory = async () => {
    try {
      await api('/api/expenses/all', { method: 'DELETE' });
      setExpenses([]);
      toast.success("All transactions cleared");
    } catch (err) {
      toast.error("Failed to clear transaction history");
    }
  };
  const handleResetOnboarding = async () => {
    try {
      const result = await api<UserSettings>('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ onboarded: false })
      });
      setSettings(result);
      window.location.href = '/';
    } catch (err) {
      toast.error("Failed to reset onboarding");
    }
  };
  return (
    <AppLayout title="Settings">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
            <p className="text-muted-foreground">Customize how you track your money.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Budget Configuration
                </CardTitle>
                <CardDescription>Manage your primary currency and monthly target.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Primary Currency</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger className="bg-secondary border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                      <SelectItem value="AED">UAE Dirham (AED)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Target Budget</Label>
                  <Input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="bg-secondary border-none"
                    placeholder="Enter amount..."
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Smart Rules
                </CardTitle>
                <CardDescription>Logical rules for budget calculation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">Carry Forward Balance</Label>
                    <p className="text-xs text-muted-foreground">Unspent funds move to next month.</p>
                  </div>
                  <Switch checked={carryForward} onCheckedChange={setCarryForward} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading} className="btn-gradient px-12 h-12 shadow-primary">
              <Save className="h-5 w-5 mr-2" />
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
          <div className="pt-8 border-t border-rose-100">
            <div className="mb-4">
              <h3 className="text-rose-600 font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground">Irreversible data management actions.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 h-16 rounded-xl flex items-center justify-start px-6">
                    <Trash2 className="h-5 w-5 mr-4" />
                    <div className="text-left">
                      <p className="font-bold">Clear All History</p>
                      <p className="text-[10px] opacity-70">Wipe every transaction record forever.</p>
                    </div>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your transaction records. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory} className="bg-rose-600 hover:bg-rose-700">Delete Everything</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleResetOnboarding} variant="outline" className="h-16 rounded-xl flex items-center justify-start px-6">
                <RotateCcw className="h-5 w-5 mr-4" />
                <div className="text-left">
                  <p className="font-bold">Reset Onboarding</p>
                  <p className="text-[10px] opacity-70">Re-run the setup wizard (Data is kept).</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
export default SettingsPage;