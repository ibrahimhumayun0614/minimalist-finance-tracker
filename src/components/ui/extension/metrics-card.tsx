import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
interface MetricsCardProps {
  title: string;
  value: number;
  currency?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}
export function MetricsCard({ title, value, currency = "$", icon, trend, className }: MetricsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 800;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= value) || (increment < 0 && current <= value)) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={cn("overflow-hidden border border-border shadow-soft group relative", className)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
            <div className="p-2.5 bg-secondary text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              {icon}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold tracking-tight flex items-baseline gap-1">
              <span className="text-lg font-medium text-muted-foreground/60">{currency}</span>
              <span>{displayValue.toLocaleString()}</span>
            </h3>
            {trend ? (
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  trend.isPositive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                )}>
                  {trend.isPositive ? "↑" : "↓"} {trend.value}%
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{trend.label}</span>
              </div>
            ) : (
              <div className="h-4" /> // Placeholder to maintain height
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}