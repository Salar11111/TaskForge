import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberSchema } from '@/lib/validations';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const member = await prisma.member.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          select: { priority: true, status: true, id: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    const priorityCounts = member.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = member.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      ...member,
      tasksByPriority: priorityCounts,
      tasksByStatus: statusCounts,
    });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch member');
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
    const validated = memberSchema.partial().parse(body);

    const member = await prisma.member.update({
      where: { id, workspaceId: ctx.workspace.id },
      data: validated,
      include: {
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to update member');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const deleted = await prisma.member.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
    if (deleted.count === 0) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to delete member');
  }
}
