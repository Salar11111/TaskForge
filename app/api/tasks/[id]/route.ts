import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskSchema } from '@/lib/validations';
import { requireWorkspace, WorkspaceError } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';
import { notifyAssignee } from '@/lib/notifications';

const taskIncludes = {
  assignee: {
    select: { id: true, name: true, image: true, color: true },
  },
  project: {
    select: { id: true, name: true, color: true },
  },
  labels: { select: { label: { select: { id: true, name: true, color: true } } } },
  sprint: { select: { id: true, name: true } },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const task = await prisma.task.findFirst({
      where: { id, project: { workspaceId: ctx.workspace.id }, deletedAt: null },
      include: taskIncludes,
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch task');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const body = await request.json();
    const validated = taskSchema.partial().parse(body);
    const { labelIds: rawLabelIds, ...rest } = validated;
    const labelIds = rawLabelIds ? [...new Set(rawLabelIds)] : undefined;

    // A task may only be moved between projects inside this workspace.
    if (validated.projectId) {
      const dest = await prisma.project.findUnique({
        where: { id: validated.projectId, workspaceId: ctx.workspace.id },
      });
      if (!dest) throw new WorkspaceError(404, 'Project not found');
    }

    const updateData = {
      ...rest,
      ...(validated.assigneeId !== undefined ? { assigneeId: validated.assigneeId } : {}),
      dueDate: validated.dueDate ? new Date(validated.dueDate) : validated.dueDate === null ? null : undefined,
      ...(labelIds ? { labels: { deleteMany: {}, create: labelIds.map((labelId) => ({ labelId })) } } : {}),
    };

    if (validated.assigneeId) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId: validated.assigneeId, workspaceId: ctx.workspace.id },
      });
      if (!membership) {
        throw new WorkspaceError(400, 'Assignee is not a member of this workspace');
      }
    }

    if (labelIds?.length) {
      const found = await prisma.label.count({ where: { id: { in: labelIds }, workspaceId: ctx.workspace.id } });
      if (found !== new Set(labelIds).size) {
        throw new WorkspaceError(400, 'Unknown label');
      }
    }

    if (validated.sprintId) {
      const sprint = await prisma.sprint.findFirst({ where: { id: validated.sprintId, workspaceId: ctx.workspace.id } });
      if (!sprint) throw new WorkspaceError(400, 'Unknown sprint');
    }

    const existing = await prisma.task.findFirst({
      where: { id, project: { workspaceId: ctx.workspace.id }, deletedAt: null },
      select: { assigneeId: true },
    });
    if (!existing) throw new WorkspaceError(404, 'Task not found');

    const task = await prisma.task.update({
      where: { id, project: { workspaceId: ctx.workspace.id }, deletedAt: null },
      data: updateData,
      include: taskIncludes,
    });

    if (validated.assigneeId !== undefined && validated.assigneeId !== existing.assigneeId) {
      await notifyAssignee(validated.assigneeId, ctx.session.user.id, task.id, task.title, ctx.workspace.id);
    }
    await prisma.activityLog.create({
      data: { action: 'updated task', meta: Object.keys(validated).join(', '), taskId: id, actorId: ctx.session.user.id },
    });
    publish('task.updated', ctx.workspace.id);
    return NextResponse.json(task);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to update task');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const deleted = await prisma.task.updateMany({
      where: { id, project: { workspaceId: ctx.workspace.id }, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (deleted.count === 0) {
      throw new WorkspaceError(404, 'Task not found');
    }
    publish('task.deleted', ctx.workspace.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to delete task');
  }
}
