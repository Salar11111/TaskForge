'use client';

import { Progress } from '@/components/ui/progress';
import { getColorTokens, type ColorName } from '@/lib/colors';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ColorName;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-1.5',
  lg: 'h-2',
};

export function ProgressBar({ value, max = 100, color = 'emerald', showLabel = false, label, size = 'md', className }: ProgressBarProps) {
  const tokens = getColorTokens(color);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className='flex items-center justify-between text-xs text-muted-foreground mb-1.5'>
          <span>{label || 'Progress'}</span>
          <span className='tabular-nums font-medium text-foreground'>{Math.round(percentage)}%</span>
        </div>
      )}
      <Progress
        value={percentage}
        aria-label={label ? `${label} (${Math.round(percentage)}%)` : `Progress (${Math.round(percentage)}%)`}
        className={cn(sizeClasses[size])}
        indicatorClassName={tokens.bar}
      />
    </div>
  );
}

export function CircularProgress({ value, max = 100, color = 'emerald', size = 64, strokeWidth = 6, className }: {
  value: number;
  max?: number;
  color?: ColorName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const tokens = getColorTokens(color);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className='transform -rotate-90'>
        <circle
          className='text-muted'
          strokeWidth={strokeWidth}
          stroke='currentColor'
          fill='transparent'
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn('transition-all duration-200', tokens.text)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          stroke='currentColor'
          fill='transparent'
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-sm font-semibold tabular-nums'>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}
