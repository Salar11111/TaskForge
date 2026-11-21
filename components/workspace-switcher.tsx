'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { workspaceApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function WorkspaceSwitcher() {
  const { data: workspaces } = useQuery({ queryKey: ['workspaces'], queryFn: () => workspaceApi.list() });
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const setActiveWorkspaceId = useAppStore((s) => s.setActiveWorkspaceId);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Only show the switcher when the user belongs to more than one workspace.
  if (!workspaces || workspaces.length < 2) return null;

  const current = activeWorkspaceId ?? workspaces[0].id;
  return (
    <div className="px-3 pt-3">
      <Select
        value={current}
        onValueChange={(id) => {
          setActiveWorkspaceId(id === workspaces[0].id ? null : id);
          queryClient.clear();
          router.push('/');
        }}
      >
        <SelectTrigger aria-label="Workspace" className="h-9 w-full">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((w) => (
            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
