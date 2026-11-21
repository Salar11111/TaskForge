'use client';

import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: { value: number; label: string };
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'emerald' | 'amber' | 'violet' | 'rose' | 'cyan' | 'slate';
  className?: string;
}

const iconStyles: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

export function StatCard({ title, value, description, trend, icon: Icon, color = 'emerald', className }: StatCardProps) {
  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md hover:-translate-y-0.5', className)}>
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <p className={cn(
                'text-xs font-medium tabular-nums',
                trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% <span className="text-muted-foreground font-normal">{trend.label}</span>
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconStyles[color])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
