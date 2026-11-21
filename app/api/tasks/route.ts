import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskSchema } from '@/lib/validations';
import { requireWorkspace, WorkspaceError } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where = {
      ...(projectId ? { projectId } : {}),
      project: { workspaceId: ctx.workspace.id },
    };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, image: true, color: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch tasks');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const body = await request.json();
    const validated = taskSchema.parse(body);

    const project = await prisma.project.findUnique({
      where: { id: validated.projectId, workspaceId: ctx.workspace.id },
    });
    if (!project) {
      throw new WorkspaceError(404, 'Project not found');
    }

    if (validated.assigneeId) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId: validated.assigneeId, workspaceId: ctx.workspace.id },
      });
      if (!membership) {
        throw new WorkspaceError(400, 'Assignee is not a member of this workspace');
      }
    }

    const maxOrder = await prisma.task.aggregate({
      where: { projectId: validated.projectId, status: validated.status },
      _max: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: {
        assignee: {
          select: { id: true, name: true, image: true, color: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    publish('task.created', ctx.workspace.id);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to create task');
  }
}