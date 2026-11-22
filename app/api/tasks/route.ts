import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskSchema } from '@/lib/validations';
import { requireWorkspace, WorkspaceError } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';
import { parsePagination } from '@/lib/pagination';
import { notifyAssignee } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const { limit, offset } = parsePagination(searchParams);

    const where = {
      ...(projectId ? { projectId } : {}),
      project: { workspaceId: ctx.workspace.id },
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, image: true, color: true } },
          project: { select: { id: true, name: true, color: true } },
          labels: { select: { label: { select: { id: true, name: true, color: true } } } },
        },
        orderBy: [{ status: 'asc' }, { order: 'asc' }],
        take: limit,
        skip: offset,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json(tasks, { headers: { 'X-Total-Count': String(total) } });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch tasks');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const body = await request.json();
    const validated = taskSchema.parse(body);
    const { labelIds = [], ...taskData } = validated;

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

    if (labelIds.length) {
      const found = await prisma.label.count({ where: { id: { in: labelIds }, workspaceId: ctx.workspace.id } });
      if (found !== new Set(labelIds).size) {
        throw new WorkspaceError(400, 'Unknown label');
      }
    }

    const maxOrder = await prisma.task.aggregate({
      where: { projectId: validated.projectId, status: validated.status },
      _max: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        ...taskData,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        order: (maxOrder._max.order ?? -1) + 1,
        labels: { create: labelIds.map((labelId) => ({ labelId })) },
      },
      include: {
        assignee: { select: { id: true, name: true, image: true, color: true } },
        project: { select: { id: true, name: true, color: true } },
        labels: { select: { label: { select: { id: true, name: true, color: true } } } },
      },
    });

    await notifyAssignee(validated.assigneeId, ctx.session.user.id, task.id, task.title, ctx.workspace.id);
    publish('task.created', ctx.workspace.id);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to create task');
  }
}