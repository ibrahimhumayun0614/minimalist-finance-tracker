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
import { Save, Wallet, ShieldCheck, Tag } from 'lucide-react';
import type { Currency, UserSettings } from '@shared/types';
export function SettingsPage() {
  const settings = useAppStore(s => s.settings);
  const setSettings = useAppStore(s => s.setSettings);
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
  return (
    <AppLayout title="Settings">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
          <p className="text-muted-foreground">Customize how you track your money.</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Card className="border shadow-soft overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-emerald-500" />
                Budget Configuration
              </CardTitle>
              <CardDescription>Manage your primary currency and monthly target.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Primary Currency</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger className="bg-secondary h-11 border-none shadow-none">
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
                  <Label className="text-sm font-semibold">Monthly Target Budget</Label>
                  <Input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="bg-secondary h-11 border-none shadow-none"
                    placeholder="Enter amount..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-soft overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                Smart Rules
              </CardTitle>
              <CardDescription>Logical rules for budget calculation.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <Label className="text-base font-semibold leading-none">Carry Forward Balance</Label>
                  <p className="text-sm text-muted-foreground">Unspent funds from the previous month are added to the current month's budget.</p>
                </div>
                <Switch checked={carryForward} onCheckedChange={setCarryForward} />
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-soft overflow-hidden opacity-60 grayscale-[0.5]">
            <CardHeader className="bg-secondary/20 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5 text-amber-500" />
                Category Management
              </CardTitle>
              <CardDescription>Custom categories (feature coming soon).</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Others'].map(c => (
                  <div key={c} className="px-3 py-1 bg-secondary rounded-full text-[10px] font-bold border uppercase tracking-widest text-muted-foreground">
                    {c}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={loading} className="btn-gradient px-12 h-12 shadow-primary text-base">
              <Save className="h-5 w-5 mr-2" />
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
export default SettingsPage;