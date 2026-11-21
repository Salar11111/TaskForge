'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getColorTokens, type ColorName } from '@/lib/colors';
import { cn } from '@/lib/utils';

interface MemberAvatarProps {
  name: string;
  avatar?: string | null;
  color: ColorName | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-[0.65rem]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-12 w-12 text-base',
};

export function MemberAvatar({ name, avatar, color, size = 'md', className }: MemberAvatarProps) {
  const tokens = getColorTokens(color);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn('ring-2 ring-background', sizeClasses[size], className)}>
      {avatar ? (
        <AvatarImage src={avatar} alt={name} />
      ) : (
        <AvatarFallback className={cn(tokens.avatarBg, 'font-medium')}>{initials}</AvatarFallback>
      )}
    </Avatar>
  );
}
