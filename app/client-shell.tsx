'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Dashboard } from '@/components/dashboard';
import { ProjectsView } from '@/components/projects-view';
import { BoardView } from '@/components/board-view';
import { TeamView } from '@/components/team-view';
import { TaskDialog, ProjectDialog, MemberDialog } from '@/components/dialogs';
import { CommandPalette } from '@/components/command-palette';
import { projectApi, memberApi, taskApi } from '@/lib/api';
import { queryKeys } from '@/lib/query';

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
    memberDialogOpen,
    memberDialogEditingId,
    setMemberDialogOpen,
  } = useAppStore();

  // Data used to resolve dialog defaults (edit state, initial status, etc.)
  const { data: projects } = useQuery({ queryKey: queryKeys.projects.list(true), queryFn: () => projectApi.list(true) });
  const { data: members } = useQuery({ queryKey: queryKeys.members.list(), queryFn: memberApi.list });
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
    : taskDialogInitialStatus
      ? { status: taskDialogInitialStatus, projectId: selectedProjectId ?? undefined }
      : undefined;

  const editedProject = projectDialogEditingId ? projects?.find((p) => p.id === projectDialogEditingId) : undefined;
  const projectDialogDefaults = editedProject
    ? {
        id: editedProject.id,
        name: editedProject.name,
        description: editedProject.description ?? undefined,
        color: editedProject.color,
      }
    : undefined;

  const editedMember = memberDialogEditingId ? members?.find((m) => m.id === memberDialogEditingId) : undefined;
  const memberDialogDefaults = editedMember
    ? {
        id: editedMember.id,
        name: editedMember.name,
        email: editedMember.email,
        avatar: editedMember.avatar ?? undefined,
        color: editedMember.color,
      }
    : undefined;

  return (
    <>
      {view === 'dashboard' && <Dashboard />}
      {view === 'projects' && <ProjectsView />}
      {view === 'board' && <BoardView />}
      {view === 'team' && <TeamView />}

      <CommandPalette />

      <TaskDialog
        isOpen={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        defaultValues={taskDialogDefaults}
        projects={projects || []}
        members={members || []}
      />

      <ProjectDialog
        isOpen={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        defaultValues={projectDialogDefaults}
      />

      <MemberDialog
        isOpen={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        defaultValues={memberDialogDefaults}
      />
    </>
  );
}
