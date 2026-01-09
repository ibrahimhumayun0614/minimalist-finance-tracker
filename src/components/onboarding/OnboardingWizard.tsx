import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import type { Currency, UserSettings } from "@shared/types";
export function OnboardingWizard() {
  const settings = useAppStore(s => s.settings);
  const setSettings = useAppStore(s => s.setSettings);
  const [step, setStep] = React.useState(1);
  const [currency, setCurrency] = React.useState<Currency>('USD');
  const [budget, setBudget] = React.useState('');
  const [carryForward, setCarryForward] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  if (!settings || settings.onboarded) return null;
  const handleComplete = async () => {
    setLoading(true);
    try {
      const newSettings: Partial<UserSettings> = {
        currency,
        monthlyBudget: Number(budget) || 0,
        carryForward,
        onboarded: true
      };
      const result = await api<UserSettings>('/api/settings', {
        method: 'POST',
        body: JSON.stringify(newSettings)
      });
      setSettings(result);
      toast.success("Welcome to FiscalFlow!");
    } catch (err) {
      toast.error("Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={!settings.onboarded}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to FiscalFlow</DialogTitle>
          <DialogDescription>Let's set up your personal finance command center.</DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <div className="space-y-4 py-4">
            <Label>Select Primary Currency</Label>
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
            <Button className="w-full btn-gradient" onClick={() => setStep(2)}>Next</Button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <Label>Monthly Budget Target ({currency})</Label>
            <Input 
              type="number" 
              placeholder="e.g. 50000" 
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="bg-secondary"
            />
            <p className="text-xs text-muted-foreground">Don't worry, you can change this later in settings.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 btn-gradient" onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="space-y-0.5">
                <Label>Carry Forward</Label>
                <p className="text-xs text-muted-foreground">Unspent budget moves to next month.</p>
              </div>
              <Switch checked={carryForward} onCheckedChange={setCarryForward} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1 btn-gradient" onClick={handleComplete} disabled={loading}>
                {loading ? "Saving..." : "Get Started"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}