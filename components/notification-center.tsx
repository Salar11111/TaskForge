'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { notificationApi } from '@/lib/api';
import { queryKeys } from '@/lib/query';
import { useAppStore } from '@/lib/store';
import { Bell } from 'lucide-react';

export function NotificationCenter() {
  const queryClient = useQueryClient();
  const setDetailTaskId = useAppStore((s) => s.setDetailTaskId);
  const { data: notifications } = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationApi.list(),
    refetchInterval: 60_000,
  });

  const items = notifications ?? [];
  const unread = items.filter((n) => !n.read).length;
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-9 w-9 relative' aria-label='Notifications'>
          <Bell className='h-4 w-4' />
          {unread > 0 && (
            <Badge className='absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[0.6rem]'>
              {unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && <DropdownMenuItem disabled>No notifications</DropdownMenuItem>}
        {items.slice(0, 8).map((n) => (
          <DropdownMenuItem
            key={n.id}
            onSelect={async () => {
              if (!n.id.startsWith('reminder-')) await notificationApi.markRead(n.id).catch(() => {});
              if (n.taskId) setDetailTaskId(n.taskId);
              refresh();
            }}
            className='flex flex-col items-start gap-0.5'
          >
            <span className={n.read ? 'text-sm text-muted-foreground' : 'text-sm font-medium'}>{n.message}</span>
            <span className='text-[0.65rem] text-muted-foreground'>{new Date(n.createdAt).toLocaleString()}</span>
          </DropdownMenuItem>
        ))}
        {items.some((n) => !n.read && !n.id.startsWith('reminder-')) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={async () => { await notificationApi.markAllRead(); refresh(); }}>
              Mark all as read
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
