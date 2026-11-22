'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sprintApi, taskApi } from '@/lib/api';
import { queryKeys } from '@/lib/query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/progress-bar';
import { getColorTokens, getStatusColor } from '@/lib/colors';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function RoadmapView() {
  const queryClient = useQueryClient();
  const searchQuery = useAppStore((s) => s.searchQuery);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const { data: sprints } = useQuery({ queryKey: queryKeys.sprints.list(), queryFn: () => sprintApi.list() });
  const { data: tasks } = useQuery({ queryKey: queryKeys.tasks.all, queryFn: () => taskApi.list() });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.sprints.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
  };

  const datesValid = !!start && !!end && !Number.isNaN(new Date(start).getTime()) && !Number.isNaN(new Date(end).getTime()) && new Date(end) >= new Date(start);

  const create = useMutation({
    mutationFn: () => sprintApi.create({
      name,
      goal: goal || null,
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
    }),
    onSuccess: () => {
      setName(''); setGoal(''); setStart(''); setEnd(''); setCreating(false);
      toast.success('Sprint created'); refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => sprintApi.delete(id),
    onSuccess: () => { toast.success('Sprint removed'); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const q = searchQuery.trim().toLowerCase();
  const visibleSprints = (sprints ?? []).filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.goal?.toLowerCase().includes(q)
  );
  const unscheduled = (tasks ?? []).filter(
    (t) => !t.sprintId && (!q || t.title.toLowerCase().includes(q))
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Roadmap</h1>
          <p className='text-sm text-muted-foreground'>Sprints and delivery timeline</p>
        </div>
        <Button variant='outline' onClick={() => setCreating((v) => !v)}><Plus className='h-4 w-4 mr-2' /> New sprint</Button>
      </div>

      {creating && (
        <Card>
          <CardContent className='grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-5'>
            <Input aria-label='Sprint name' placeholder='Sprint name' value={name} onChange={(e) => setName(e.target.value)} />
            <Input aria-label='Sprint goal' placeholder='Goal (optional)' value={goal} onChange={(e) => setGoal(e.target.value)} />
            <Input aria-label='Start date' type='date' value={start} onChange={(e) => setStart(e.target.value)} />
            <Input aria-label='End date' type='date' value={end} onChange={(e) => setEnd(e.target.value)} />
            <Button variant='outline' disabled={!name || !datesValid || create.isPending} onClick={() => create.mutate()}>Create</Button>
          </CardContent>
        </Card>
      )}

      {visibleSprints.length === 0 && !creating && (
        <p className='text-sm text-muted-foreground'>{q ? 'No matching sprints' : 'No sprints yet. Create one to plan a delivery window.'}</p>
      )}

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {visibleSprints.map((sprint) => {
          const sprintTasks = (tasks ?? []).filter(
            (t) => t.sprintId === sprint.id && (!q || t.title.toLowerCase().includes(q))
          );
          const pct = sprint.taskCount ? Math.round((sprint.completed / sprint.taskCount) * 100) : 0;
          return (
            <Card key={sprint.id}>
              <CardHeader className='flex flex-row items-start justify-between gap-2'>
                <div>
                  <CardTitle>{sprint.name}</CardTitle>
                  <p className='text-xs text-muted-foreground'>
                    {new Date(sprint.startDate).toLocaleDateString()} – {new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Button variant='ghost' size='icon' aria-label={`Delete sprint ${sprint.name}`} onClick={() => remove.mutate(sprint.id)}>
                  <Trash2 className='h-4 w-4' />
                </Button>
              </CardHeader>
              <CardContent className='space-y-3'>
                {sprint.goal && <p className='text-sm text-muted-foreground'>{sprint.goal}</p>}
                <ProgressBar value={pct} color='emerald' showLabel label='Progress' />
                <div className='space-y-1'>
                  {sprintTasks.map((t) => (
                    <div key={t.id} className='flex items-center justify-between gap-2 text-sm'>
                      <span className='truncate'>{t.title}</span>
                      <Badge variant='outline' className={getColorTokens(getStatusColor(t.status)).badge}>{t.status.replace('_', ' ')}</Badge>
                    </div>
                  ))}
                  {sprintTasks.length === 0 && <p className='text-xs text-muted-foreground'>No tasks in this sprint yet.</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {unscheduled.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Unscheduled tasks ({unscheduled.length})</CardTitle></CardHeader>
          <CardContent className='space-y-1'>
            {unscheduled.slice(0, 20).map((t) => (
              <div key={t.id} className='flex items-center justify-between gap-2 text-sm'>
                <span className='truncate'>{t.title}</span>
                <Badge variant='outline' className={getColorTokens(getStatusColor(t.status)).badge}>{t.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
