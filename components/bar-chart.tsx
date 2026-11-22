'use client';

import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  className?: string;
}

const TAILWIND_TO_CSS: Record<string, string> = {
  'bg-emerald-500': '#10b981',
  'bg-amber-500': '#f59e0b',
  'bg-violet-500': '#8b5cf6',
  'bg-slate-500': '#64748b',
  'bg-rose-500': '#f43f5e',
  'bg-cyan-500': '#06b6d4',
  'bg-orange-500': '#f97316',
  'bg-teal-500': '#14b8a6',
  'bg-pink-500': '#ec4899',
  'bg-sky-500': '#0ea5e9',
};

function toCssColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl') || value.startsWith('var(') || value.startsWith('oklch')) return value;
  if (TAILWIND_TO_CSS[value]) return TAILWIND_TO_CSS[value];
  return fallback;
}

export function BarChart({ data, className }: BarChartProps) {
  const fallbackPalette = ['#64748b', '#0ea5e9', '#f97316', '#f43f5e'];
  const chartData = data.map((item, i) => ({
    ...item,
    color: toCssColor(item.color, fallbackPalette[i % fallbackPalette.length]),
  }));

  const hasData = chartData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className={cn('flex items-center justify-center h-[220px]', className)}>
        <div className='text-center text-sm text-muted-foreground'>No data available</div>
      </div>
    );
  }

  return (
    <div className={cn('h-[220px] w-full', className)} aria-hidden='true' tabIndex={-1}>
      <ResponsiveContainer width='100%' height='100%'>
        <RechartsBarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid
            horizontal={true}
            vertical={false}
            strokeDasharray='3 3'
            stroke='var(--border)'
          />
          <XAxis
            dataKey='name'
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value: number) => [value, 'tasks']}
            cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--popover-foreground)',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'var(--popover-foreground)' }}
          />
          <Bar dataKey='value' radius={[6, 6, 0, 0]} maxBarSize={64}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
