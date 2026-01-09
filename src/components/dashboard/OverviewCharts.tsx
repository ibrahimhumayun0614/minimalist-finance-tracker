import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Expense } from '@shared/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];
export function OverviewCharts({ expenses }: { expenses: Expense[] }) {
  // Process daily trend
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailyData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTotal = expenses
      .filter(e => e.date.startsWith(dateStr))
      .reduce((sum, e) => sum + e.amount, 0);
    return { date: format(day, 'MMM d'), amount: dayTotal };
  });
  const hasData = expenses.length > 0;
  // Process category breakdown
  const categoryMap: Record<string, number> = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border shadow-soft overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Spending Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] p-0 pr-4 pb-4">
          {!hasData ? (
             <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm opacity-50 px-8 text-center">
               Waiting for transactions to generate a spending trend...
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis 
                  dataKey="date" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))'}} 
                  minTickGap={20}
                />
                <YAxis 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `${v}`} 
                  tick={{fill: 'hsl(var(--muted-foreground))'}} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    border: '1px solid hsl(var(--border))'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card className="border shadow-soft overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Category Split</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] flex items-center justify-center p-6">
          {!hasData ? (
             <div className="text-center text-muted-foreground text-sm opacity-50 px-8">
               Add transactions to see your category breakdown.
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationBegin={200}
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip
                   contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '500' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}