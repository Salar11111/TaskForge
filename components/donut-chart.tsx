'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface DonutChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  total: number;
  unit?: string;
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

export function DonutChart({ data, total, unit = 'tasks', className }: DonutChartProps) {
  const fallbackPalette = ['#64748b', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e', '#06b6d4', '#f97316', '#14b8a6', '#ec4899', '#0ea5e9'];
  const chartData = data.map((item, i) => ({
    ...item,
    color: toCssColor(item.color, fallbackPalette[i % fallbackPalette.length]),
  }));

  const filteredData = chartData.filter((d) => d.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[220px]', className)}>
        <div className='text-center text-sm text-muted-foreground'>No data available</div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className='relative h-[180px] w-[180px] shrink-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={filteredData}
              cx='50%'
              cy='50%'
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey='value'
              nameKey='name'
              stroke='none'
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--popover-foreground)',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--popover-foreground)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
          <div className='text-2xl font-semibold tabular-nums text-foreground leading-none'>{total}</div>
          <div className='text-[0.65rem] uppercase tracking-wide text-muted-foreground mt-1'>{unit}</div>
        </div>
      </div>

      <div className='flex flex-col gap-2 text-sm min-w-0'>
        {filteredData.map((entry) => (
          <div key={entry.name} className='flex items-center gap-2 min-w-0'>
            <span className='w-2.5 h-2.5 rounded-full shrink-0' style={{ backgroundColor: entry.color }} />
            <span className='text-foreground truncate'>{entry.name}</span>
            <span className='text-muted-foreground tabular-nums ml-auto'>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
