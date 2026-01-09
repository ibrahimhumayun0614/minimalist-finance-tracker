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
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailyData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTotal = expenses
      .filter(e => e.date.startsWith(dateStr))
      .reduce((sum, e) => sum + e.amount, 0);
    return { date: format(day, 'MMM d'), amount: dayTotal };
  });
  // Process category breakdown
  const categoryMap: Record<string, number> = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-soft overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Spending Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] p-0 pr-4 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} tick={{fill: 'hsl(var(--muted-foreground))'}} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border-none shadow-soft overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          {pieData.length === 0 ? (
             <div className="text-center text-muted-foreground text-sm opacity-50">
               No data available for the current month
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px'
                  }} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}