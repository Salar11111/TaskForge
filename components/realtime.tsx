'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query';
import { useAppStore } from '@/lib/store';

/** Keeps the current view fresh when another client mutates shared data. */
export function Realtime() {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);

  useEffect(() => {
    const query = activeWorkspaceId ? `?workspaceId=${encodeURIComponent(activeWorkspaceId)}` : '';
    const source = new EventSource(`/api/realtime${query}`);

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (!payload.type || payload.type === 'connected' || payload.type === 'ping') return;
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      } catch {
        // Ignore malformed frames.
      }
    };

    return () => source.close();
  }, [queryClient, activeWorkspaceId]);

  return null;
}
