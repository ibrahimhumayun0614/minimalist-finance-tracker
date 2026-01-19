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
    const duration = 800;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    if (value === 0) {
      setDisplayValue(0);
      return;
    }
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
      className="h-full"
    >
      <Card className={cn("overflow-hidden border border-border shadow-soft group relative h-full", className)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate mr-2">
              {title}
            </p>
            <div className="p-2 bg-secondary text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
              {icon}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight flex items-baseline gap-1 overflow-hidden">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground/60">{currency}</span>
              <span className="truncate">{displayValue.toLocaleString()}</span>
            </h3>
            {trend ? (
              <div className="flex items-center gap-1.5 min-h-[1.25rem]">
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-md border",
                  trend.isPositive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                )}>
                  {trend.isPositive ? "↑" : "↓"} {trend.value}%
                </span>
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight truncate">
                  {trend.label}
                </span>
              </div>
            ) : (
              <div className="h-5" /> 
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}