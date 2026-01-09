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
  const categoryMap: Record<string, number> = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const pieData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border shadow-soft overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">Spending Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] p-0 pr-6 pb-4">
          {!hasData ? (
             <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-[11px] font-bold uppercase tracking-wider opacity-50 px-8 text-center">
               Waiting for activity to generate a trend...
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  dataKey="date"
                  fontSize={10}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  tick={{fill: 'hsl(var(--muted-foreground))'}}
                  minTickGap={30}
                  dy={10}
                />
                <YAxis
                  fontSize={10}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                  tick={{fill: 'hsl(var(--muted-foreground))'}}
                  width={40}
                />
                <Tooltip
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    border: '1px solid hsl(var(--border))',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ fontSize: '11px', fontWeight: '800', color: 'hsl(var(--primary))' }}
                  labelStyle={{ fontSize: '10px', fontWeight: '900', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  animationDuration={1500}
                  activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#10B981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card className="border shadow-soft overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">Category Allocation</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] flex items-center justify-center p-6">
          {!hasData ? (
             <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-[11px] font-bold uppercase tracking-wider opacity-50 px-8 text-center">
               Add transactions to see your spending mix.
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  animationBegin={200}
                  animationDuration={1200}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-80 cursor-pointer outline-none transition-opacity" 
                    />
                  ))}
                </Pie>
                <Tooltip
                   contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ fontSize: '11px', fontWeight: '800' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}