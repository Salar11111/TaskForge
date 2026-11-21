'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Dashboard } from '@/components/dashboard';
import { ProjectsView } from '@/components/projects-view';
import { BoardView } from '@/components/board-view';
import { TeamView } from '@/components/team-view';
import { TaskDialog, ProjectDialog, UserDialog } from '@/components/dialogs';
import { CommandPalette } from '@/components/command-palette';
import { Realtime } from '@/components/realtime';
import { projectApi, taskApi, userApi } from '@/lib/api';
import { queryKeys } from '@/lib/query';
import { type ColorName } from '@/lib/colors';

export default function ClientShell() {
  const {
    view,
    selectedProjectId,
    taskDialogOpen,
    taskDialogEditingId,
    taskDialogInitialStatus,
    setTaskDialogOpen,
    projectDialogOpen,
    projectDialogEditingId,
    setProjectDialogOpen,
    userDialogOpen,
    userDialogEditingId,
    setUserDialogOpen,
  } = useAppStore();

  // Data used to resolve dialog defaults (edit state, initial status, etc.)
  const { data: projects } = useQuery({ queryKey: queryKeys.projects.list(true), queryFn: () => projectApi.list(true) });
  const { data: users } = useQuery({ queryKey: queryKeys.users.list(), queryFn: () => userApi.list() });
  const { data: tasks } = useQuery({ queryKey: queryKeys.tasks.all, queryFn: () => taskApi.list() });

  const editedTask = taskDialogEditingId ? tasks?.find((t) => t.id === taskDialogEditingId) : undefined;
  const taskDialogDefaults = editedTask
    ? {
        id: editedTask.id,
        title: editedTask.title,
        description: editedTask.description ?? undefined,
        status: editedTask.status,
        priority: editedTask.priority,
        projectId: editedTask.projectId,
        assigneeId: editedTask.assigneeId ?? undefined,
        dueDate: editedTask.dueDate ?? undefined,
        order: editedTask.order,
      }
    : { projectId: selectedProjectId ?? undefined, ...(taskDialogInitialStatus ? { status: taskDialogInitialStatus } : {}) };

  const editedProject = projectDialogEditingId ? projects?.find((p) => p.id === projectDialogEditingId) : undefined;
  const projectDialogDefaults = editedProject
    ? {
        id: editedProject.id,
        name: editedProject.name,
        description: editedProject.description ?? undefined,
        color: editedProject.color,
      }
    : undefined;

  const editedUser = userDialogEditingId ? users?.find((u) => u.id === userDialogEditingId) : undefined;
  const userDialogDefaults = editedUser
    ? {
        id: editedUser.id,
        name: editedUser.name,
        email: editedUser.email,
        image: editedUser.image ?? undefined,
        color: editedUser.color as ColorName,
      }
    : undefined;

  return (
    <>
      {view === 'dashboard' && <Dashboard />}
      {view === 'projects' && <ProjectsView />}
      {view === 'board' && <BoardView />}
      {view === 'team' && <TeamView />}

      <CommandPalette />
      <Realtime />

      <TaskDialog
        isOpen={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        defaultValues={taskDialogDefaults}
        projects={projects || []}
        users={users || []}
      />

      <ProjectDialog
        isOpen={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        defaultValues={projectDialogDefaults}
      />

      <UserDialog
        isOpen={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        defaultValues={userDialogDefaults}
      />
    </>
  );
}
