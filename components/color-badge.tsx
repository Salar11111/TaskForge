'use client';

import { getColorTokens, getStatusColor, getPriorityColor, type ColorName } from '@/lib/colors';
import { cn } from '@/lib/utils';

interface ColorBadgeProps {
  children: React.ReactNode;
  color?: ColorName;
  status?: string;
  priority?: string;
  variant?: 'dot' | 'badge' | 'soft';
  className?: string;
}

export function ColorBadge({ children, color, status, priority, variant = 'badge', className }: ColorBadgeProps) {
  let tokens = getColorTokens('emerald');

  if (status) {
    tokens = getColorTokens(getStatusColor(status));
  } else if (priority) {
    tokens = getColorTokens(getPriorityColor(priority));
  } else if (color) {
    tokens = getColorTokens(color);
  }

  const variantClasses = {
    dot: 'inline-flex items-center gap-1.5',
    badge: 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
    soft: 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
  };

  const variantStyles = {
    dot: tokens.dot,
    badge: tokens.badge,
    soft: tokens.soft,
  };

  if (variant === 'dot') {
    return (
      <span className={cn(variantClasses[variant], className)}>
        <span className={cn('w-2 h-2 rounded-full', variantStyles[variant])} />
        {children}
      </span>
    );
  }

  return (
    <span className={cn(variantClasses[variant], variantStyles[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <ColorBadge status={status} variant="badge" className={className}>{status.replace('_', ' ')}</ColorBadge>;
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  return <ColorBadge priority={priority} variant="badge" className={className}>{priority.replace('_', ' ')}</ColorBadge>;
}

export function ColorDot({ color, className }: { color: ColorName; className?: string }) {
  const tokens = getColorTokens(color);
  return <span className={cn('w-2 h-2 rounded-full', tokens.dot, className)} />;
}
