import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
export default function SettingsPage() {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-6">
        <h1 className="text-2xl font-bold">Preferences</h1>
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-500" />
                Budget Configuration
              </CardTitle>
              <CardDescription>Manage your spending limits and currency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Currency</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger className="bg-secondary">
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
                  <Label>Monthly Target</Label>
                  <Input 
                    type="number" 
                    value={budget} 
                    onChange={e => setBudget(e.target.value)}
                    className="bg-secondary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                Logic Rules
              </CardTitle>
              <CardDescription>Customize how FiscalFlow calculates your available funds.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Carry Forward Balance</Label>
                  <p className="text-sm text-muted-foreground">Automatically add remaining savings from previous month to current budget.</p>
                </div>
                <Switch checked={carryForward} onCheckedChange={setCarryForward} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-soft opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-500" />
                Category Management
              </CardTitle>
              <CardDescription>Define custom categories for your expenses (Coming Soon).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Others'].map(c => (
                  <div key={c} className="px-3 py-1 bg-secondary rounded-full text-xs font-medium">
                    {c}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={loading} className="btn-gradient px-8">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}