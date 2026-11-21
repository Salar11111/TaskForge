import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskSchema } from '@/lib/validations';
import { requireWorkspace, WorkspaceError } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

const taskIncludes = {
  assignee: {
    select: { id: true, name: true, avatar: true, color: true },
  },
  project: {
    select: { id: true, name: true, color: true },
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const task = await prisma.task.findFirst({
      where: { id, project: { workspaceId: ctx.workspace.id } },
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

    const updateData = {
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : validated.dueDate === null ? null : undefined,
    };

    if (validated.assigneeId) {
      const member = await prisma.member.findUnique({
        where: { id: validated.assigneeId },
      });
      if (!member || member.workspaceId !== ctx.workspace.id) {
        throw new WorkspaceError(400, 'Assignee is not a member of this workspace');
      }
    }

    const updated = await prisma.task.updateMany({
      where: { id, project: { workspaceId: ctx.workspace.id } },
      data: updateData,
    });
    if (updated.count === 0) {
      throw new WorkspaceError(404, 'Task not found');
    }

    const task = await prisma.task.findFirst({
      where: { id, project: { workspaceId: ctx.workspace.id } },
      include: taskIncludes,
    });
    if (!task) {
      throw new WorkspaceError(404, 'Task not found');
    }

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
    const deleted = await prisma.task.deleteMany({
      where: { id, project: { workspaceId: ctx.workspace.id } },
    });
    if (deleted.count === 0) {
      throw new WorkspaceError(404, 'Task not found');
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to delete task');
  }
}
