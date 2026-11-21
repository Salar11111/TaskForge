'use client';

import { projectSchema, taskSchema, userSchema, type ProjectInput, type TaskInput, type UserInput } from '@/lib/validations';
import { FormDialog } from '@/components/form-dialog';
import { projectApi, taskApi, userApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query';
import { availableColors, getColorTokens } from '@/lib/colors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type DialogDefaults<T> = Partial<T> & { id?: string };

function projectDefaults(defaultValues?: DialogDefaults<ProjectInput>) {
  return {
    name: defaultValues?.name ?? '',
    description: defaultValues?.description ?? '',
    color: defaultValues?.color ?? 'emerald',
  };
}

function taskDefaults(defaultValues?: DialogDefaults<TaskInput>, projects: Array<{ id: string; name: string }> = []) {
  return {
    title: defaultValues?.title ?? '',
    description: defaultValues?.description ?? '',
    status: defaultValues?.status ?? 'TODO',
    priority: defaultValues?.priority ?? 'MEDIUM',
    projectId: defaultValues?.projectId ?? projects[0]?.id ?? '',
    assigneeId: defaultValues?.assigneeId ?? undefined,
    dueDate: defaultValues?.dueDate ?? null,
    order: defaultValues?.order ?? 0,
  };
}

function toDateTimeLocal(value?: string | null): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function userDefaults(defaultValues?: DialogDefaults<UserInput>) {
  return {
    name: defaultValues?.name ?? '',
    email: defaultValues?.email ?? '',
    image: defaultValues?.image ?? '',
    color: defaultValues?.color ?? 'emerald',
  };
}

export function ProjectDialog({ isOpen, onClose, defaultValues }: { isOpen: boolean; onClose: () => void; defaultValues?: DialogDefaults<ProjectInput> }) {
  const queryClient = useQueryClient();

  return (
    <FormDialog
      schema={projectSchema}
      title={defaultValues ? 'Edit Project' : 'New Project'}
      description={defaultValues ? 'Update project details' : 'Create a new project'}
      defaultValues={projectDefaults(defaultValues)}
      isOpen={isOpen}
      onClose={onClose}
      submitLabel={defaultValues ? 'Update' : 'Create'}
      onSubmit={async (data) => {
        if (defaultValues?.id) {
          await projectApi.update(defaultValues.id, data);
        } else {
          await projectApi.create(data);
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      }}
    >
      {(dialogForm) => (
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" {...dialogForm.register('name')} placeholder="Project name" />
            {dialogForm.formState.errors.name && <p className="text-sm text-destructive">{dialogForm.formState.errors.name.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...dialogForm.register('description')} placeholder="Project description" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select
              value={dialogForm.watch('color') || 'emerald'}
              onValueChange={(value) => dialogForm.setValue('color', value as (typeof availableColors)[number], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {availableColors.map((color) => (
                  <SelectItem key={color} value={color}>
                    <span className="flex items-center gap-2">
                      <span className={cn("w-3 h-3 rounded-full", getColorTokens(color).dot)} />
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </FormDialog>
  );
}

export function TaskDialog({ isOpen, onClose, defaultValues, projects, users }: { 
  isOpen: boolean; 
  onClose: () => void; 
  defaultValues?: DialogDefaults<TaskInput>;
  projects: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
}) {
  const queryClient = useQueryClient();

  return (
    <FormDialog
      schema={taskSchema}
      title={defaultValues?.id ? 'Edit Task' : 'New Task'}
      description={defaultValues?.id ? 'Update task details' : 'Create a new task'}
      defaultValues={taskDefaults(defaultValues, projects)}
      isOpen={isOpen}
      onClose={onClose}
      submitLabel={defaultValues?.id ? 'Update' : 'Create'}
      onSubmit={async (data) => {
        if (defaultValues?.id) {
          await taskApi.update(defaultValues.id, data);
        } else {
          await taskApi.create(data);
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      }}
    >
      {(dialogForm) => (
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input id="title" {...dialogForm.register('title')} placeholder="Task title" />
            {dialogForm.formState.errors.title && <p className="text-sm text-destructive">{dialogForm.formState.errors.title.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...dialogForm.register('description')} placeholder="Task description" rows={3} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={dialogForm.watch('status') || 'TODO'}
                onValueChange={(value) => dialogForm.setValue('status', value as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', { shouldValidate: true })}
              >
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={dialogForm.watch('priority') || 'MEDIUM'}
                onValueChange={(value) => dialogForm.setValue('priority', value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT', { shouldValidate: true })}
              >
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectId">Project <span className="text-destructive">*</span></Label>
            <Select
              value={dialogForm.watch('projectId') || projects[0]?.id || ''}
              onValueChange={(value) => dialogForm.setValue('projectId', value, { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assigneeId">Assignee</Label>
              <Select
                value={dialogForm.watch('assigneeId') ?? ''}
                onValueChange={(value) => dialogForm.setValue('assigneeId', value || undefined, { shouldValidate: true })}
              >
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={toDateTimeLocal(dialogForm.watch('dueDate'))}
                onChange={(event) => {
                  const value = event.target.value;
                  dialogForm.setValue('dueDate', value ? new Date(value).toISOString() : null, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
              {dialogForm.formState.errors.dueDate && (
                <p className="text-sm text-destructive">{dialogForm.formState.errors.dueDate.message as string}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </FormDialog>
  );
}

export function UserDialog({ isOpen, onClose, defaultValues }: { isOpen: boolean; onClose: () => void; defaultValues?: DialogDefaults<UserInput> }) {
  const queryClient = useQueryClient();

  return (
    <FormDialog
      schema={userSchema}
      title={defaultValues ? 'Edit Member' : 'New Member'}
      description={defaultValues ? 'Update member details' : 'Add a new team member'}
      defaultValues={userDefaults(defaultValues)}
      isOpen={isOpen}
      onClose={onClose}
      submitLabel={defaultValues ? 'Update' : 'Add'}
      onSubmit={async (data) => {
        if (defaultValues?.id) {
          await userApi.update(defaultValues.id, data);
        } else {
          await userApi.create(data);
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      }}
    >
      {(dialogForm) => (
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" {...dialogForm.register('name')} placeholder="Full name" />
            {dialogForm.formState.errors.name && <p className="text-sm text-destructive">{dialogForm.formState.errors.name.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input id="email" type="email" {...dialogForm.register('email')} placeholder="email@example.com" />
            {dialogForm.formState.errors.email && <p className="text-sm text-destructive">{dialogForm.formState.errors.email.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Avatar URL</Label>
            <Input id="image" {...dialogForm.register('image')} placeholder="https://example.com/avatar.png" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select
              value={dialogForm.watch('color') || 'emerald'}
              onValueChange={(value) => dialogForm.setValue('color', value as (typeof availableColors)[number], { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
              <SelectContent>
                {availableColors.map((color) => (
                  <SelectItem key={color} value={color}>
                    <span className="flex items-center gap-2">
                      <span className={cn("w-3 h-3 rounded-full", getColorTokens(color).dot)} />
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </FormDialog>
  );
}
