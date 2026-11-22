'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { taskApi, projectApi, type Task } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { getColorTokens, getStatusColor, getPriorityColor } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query';
import { changedUpdates } from '@/lib/reorder';
import { MemberAvatar } from '@/components/member-avatar';
import { formatRelativeDate } from '@/lib/dates';
import { useAppStore } from '@/lib/store';

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
type Status = typeof STATUSES[number];
const STATUS_LABELS: Record<Status, string> = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done' };

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onOpenDetail: () => void;
  overlay?: boolean;
}

function TaskCardContent({ task, onEdit, onDelete, onOpenDetail, overlay }: TaskCardProps) {
  const priorityTokens = getColorTokens(getPriorityColor(task.priority));

  return (
    <Card className={cn(
      'group rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200',
      overlay ? 'rotate-2 opacity-90 shadow-lg ring-2 ring-emerald-500/40' : 'hover:shadow-md hover:-translate-y-0.5'
    )}>
      <div className='flex items-start justify-between gap-2 mb-1.5'>
        <h4
          className='font-medium text-sm leading-snug line-clamp-2 flex-1 cursor-pointer hover:underline'
          onClick={onOpenDetail}
          title='Open task details'
        >
          {task.title}
        </h4>
        {!overlay && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
                <MoreHorizontal className='h-3.5 w-3.5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={onEdit}><Edit className='h-4 w-4 mr-2' /> Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-destructive' onClick={onDelete}><Trash2 className='h-4 w-4 mr-2' /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {task.description && <p className='text-xs text-muted-foreground mb-2 line-clamp-2'>{task.description}</p>}
      <div className='flex items-center justify-between gap-2 mt-2'>
        <div className='flex items-center gap-1.5 flex-wrap'>
          <Badge variant='outline' className={cn('text-[0.65rem] px-1.5 py-0 h-5', priorityTokens.badge)}>
            {task.priority}
          </Badge>
          {task.dueDate && (
            <span className='text-[0.65rem] text-muted-foreground tabular-nums'>{formatRelativeDate(task.dueDate)}</span>
          )}
        </div>
        {task.assignee && (
          <MemberAvatar name={task.assignee.name} avatar={task.assignee.image} color={task.assignee.color || 'emerald'} size='sm' />
        )}
      </div>
    </Card>
  );
}

function SortableTaskCard({ task, onEdit, onDelete, onOpenDetail }: Omit<TaskCardProps, 'overlay'>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={cn(isDragging && 'opacity-40 ring-2 ring-emerald-500/40 shadow-lg rounded-lg')}>
      <TaskCardContent task={task} onEdit={onEdit} onDelete={onDelete} onOpenDetail={onOpenDetail} />
    </div>
  );
}

function Column({ status, tasks, onAddTask, onEditTask, onDeleteTask, onOpenDetail, isOver }: {
  status: Status;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  isOver: boolean;
}) {
  const statusColor = getStatusColor(status);
  const tokens = getColorTokens(statusColor);
  const { setNodeRef } = useDroppable({ id: `column-${status}` });

  return (
    <div className={cn(
      'flex flex-col min-h-[500px] w-72 flex-shrink-0 rounded-xl border bg-muted/30 transition-all duration-200',
      isOver && 'border-emerald-500/50 bg-emerald-500/5'
    )}>
      <div className='flex items-center justify-between p-3 border-b border-border/50'>
        <div className='flex items-center gap-2'>
          <span className={cn('h-2 w-2 rounded-full', tokens.dot)} />
          <h2 className='font-semibold text-sm tracking-tight'>{STATUS_LABELS[status]}</h2>
          <span className='inline-flex items-center justify-center rounded-full bg-muted px-1.5 min-w-[1.25rem] h-5 text-[0.65rem] font-medium text-muted-foreground tabular-nums'>{tasks.length}</span>
        </div>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={onAddTask} aria-label={`Add task to ${STATUS_LABELS[status]}`}>
          <Plus className='h-4 w-4' />
        </Button>
      </div>
      <div ref={setNodeRef} className='flex-1 overflow-y-auto p-2 space-y-2'>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <button
              onClick={onAddTask}
              className="flex w-full items-center justify-center h-20 text-xs text-muted-foreground border-2 border-dashed border-border/60 rounded-lg hover:border-emerald-500/40 hover:text-foreground transition-colors"
            >
              <Plus className='h-3.5 w-3.5 mr-1.5' /> Add task
            </button>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task)}
                onOpenDetail={() => onOpenDetail(task)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export function BoardView() {
  const queryClient = useQueryClient();
  const { selectedProjectId, setSelectedProjectId, setTaskDialogOpen, setDetailTaskId, searchQuery } = useAppStore();
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<Status | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  const { data: projects } = useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => projectApi.list(),
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: queryKeys.tasks.list(selectedProjectId || ''),
    queryFn: () => taskApi.list(selectedProjectId || ''),
    enabled: Boolean(selectedProjectId),
  });

  useEffect(() => {
    if (tasks) setLocalTasks(tasks);
  }, [tasks]);

  // If the stored project no longer exists (deleted, or from a different
  // workspace), fall back to the first available project.
  useEffect(() => {
    if (!selectedProjectId || !projects) return;
    if (!projects.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId, setSelectedProjectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const reorderMutation = useMutation({
    mutationFn: async (payload: { tasks: Task[]; updates: { id: string; status: Status; order: number }[] }) => {
      return taskApi.reorder(payload.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: () => {
      toast.error('Failed to move task');
      if (tasks) setLocalTasks(tasks);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      toast.success('Task deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return localTasks;
    return localTasks.filter((task) =>
      task.title.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q) ||
      task.assignee?.name.toLowerCase().includes(q)
    );
  }, [localTasks, searchQuery]);

  const groupedTasks = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status] = filteredTasks.filter((task) => task.status === status).sort((a, b) => a.order - b.order);
      return acc;
    }, {} as Record<Status, Task[]>);
  }, [filteredTasks]);

  const findContainer = useCallback((id: string): Status | null => {
    if (id.startsWith('column-')) return id.replace('column-', '') as Status;
    const task = localTasks.find(t => t.id === id);
    return task ? (task.status as Status) : null;
  }, [localTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) { setOverColumn(null); return; }
    setOverColumn(findContainer(over.id as string));
  };

  // Only send rows whose status/order actually changed — not whole columns.
  const commitReorder = useCallback((next: Task[]) => {
    setLocalTasks(next);
    const updates = changedUpdates(next, tasks ?? []);
    if (updates.length > 0) reorderMutation.mutate({ tasks: next, updates });
  }, [tasks, reorderMutation]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);
    if (!over) return;

    const activeTask = localTasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overContainer = findContainer(over.id as string);
    if (!overContainer) return;

    const activeContainer = activeTask.status as Status;
    let nextTasks = [...localTasks];

    if (activeContainer === overContainer) {
      const items = groupedTasks[activeContainer];
      const oldIndex = items.findIndex(t => t.id === active.id);
      const overId = (over.id as string).startsWith('column-') ? items[items.length - 1]?.id : (over.id as string);
      const newIndex = items.findIndex(t => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(items, oldIndex, newIndex).map((t, i) => ({ ...t, order: i }));
        nextTasks = nextTasks.map(t => reordered.find(r => r.id === t.id) || t);
        commitReorder(nextTasks);
      }
      return;
    }

    // cross-column move
    const sourceItems = groupedTasks[activeContainer].filter(t => t.id !== active.id);
    const destItems = [...groupedTasks[overContainer]];
    const overIndex = (over.id as string).startsWith('column-') ? destItems.length : destItems.findIndex(t => t.id === over.id);
    const insertAt = overIndex === -1 ? destItems.length : overIndex;
    const moved = { ...activeTask, status: overContainer };
    destItems.splice(insertAt, 0, moved);
    const reSource = sourceItems.map((t, i) => ({ ...t, order: i }));
    const reDest = destItems.map((t, i) => ({ ...t, status: overContainer, order: i }));
    nextTasks = nextTasks.map(t => {
      if (t.id === moved.id) return reDest.find(r => r.id === t.id)!;
      return reSource.find(r => r.id === t.id) || reDest.find(r => r.id === t.id) || t;
    });
    commitReorder(nextTasks);
  }, [localTasks, groupedTasks, findContainer, commitReorder]);

  const activeTask = activeId ? localTasks.find(t => t.id === activeId) : null;

  if (!selectedProjectId) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Board</h1>
          <p className='text-sm text-muted-foreground'>Choose a project to view its Kanban board</p>
        </div>
        <Card className="max-w-md">
          <CardHeader><CardTitle>Select a Project</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedProjectId || ''} onValueChange={setSelectedProjectId}>
              <SelectTrigger aria-label='Project' className='w-full'><SelectValue placeholder='Select project' /></SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Board</h1>
            <p className='text-sm text-muted-foreground'>Loading tasks...</p>
          </div>
        </div>
        <div className='flex gap-4 overflow-x-auto pb-4'>
          {STATUSES.map((status) => (
            <div key={status} className='flex flex-col min-h-[500px] w-72 flex-shrink-0 rounded-xl border bg-muted/30 animate-pulse'>
              <div className='h-12 border-b border-border/50' />
              <div className='p-2 space-y-2'>
                <div className='h-20 rounded-lg bg-muted' />
                <div className='h-20 rounded-lg bg-muted' />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Board</h1>
          <p className='text-sm text-muted-foreground'>Drag tasks between columns to update status</p>
        </div>
        <div className='flex items-center gap-3'>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger aria-label='Project' className='w-56 h-9'><SelectValue placeholder='Select project' /></SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setTaskDialogOpen(true)}>
            <Plus className='h-4 w-4 mr-2' /> New Task
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className='flex gap-4 overflow-x-auto pb-4'>
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={groupedTasks[status] || []}
              isOver={overColumn === status}
              onAddTask={() => setTaskDialogOpen(true, null, status)}
              onEditTask={(task) => setTaskDialogOpen(true, task.id)}
              onDeleteTask={setDeletingTask}
              onOpenDetail={(task) => setDetailTaskId(task.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCardContent task={activeTask} onEdit={() => {}} onDelete={() => {}} onOpenDetail={() => {}} overlay /> : null}
        </DragOverlay>
      </DndContext>

      <AlertDialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{deletingTask?.title}&quot;? This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogAction
            onClick={() => { if (deletingTask) { deleteTaskMutation.mutate(deletingTask.id); setDeletingTask(null); } }}
            className='bg-rose-600 hover:bg-rose-700 text-white'
          >
            Delete
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
