'use client';

import { MemberAvatar } from '@/components/member-avatar';
import { cn } from '@/lib/utils';
import { ColorName } from '@/lib/colors';

interface AvatarStackProps {
  members: Array<{ id: string; name: string; avatar?: string | null; color: ColorName | string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarStack({ members, max = 5, size = 'md', className }: AvatarStackProps) {
  const visible = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <div className={cn('flex -space-x-2', className)} aria-label={`${members.length} team members`}>
      {visible.map((member) => (
        <MemberAvatar key={member.id} name={member.name} avatar={member.avatar} color={member.color} size={size} />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background font-medium tabular-nums',
            size === 'sm' && 'h-6 w-6 text-[0.65rem]',
            size === 'md' && 'h-8 w-8 text-xs',
            size === 'lg' && 'h-10 w-10 text-sm',
            size === 'xl' && 'h-12 w-12 text-base'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}