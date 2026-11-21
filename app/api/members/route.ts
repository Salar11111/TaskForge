import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberSchema } from '@/lib/validations';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const members = await prisma.member.findMany({
      where: { workspaceId: ctx.workspace.id },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: { priority: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const membersWithBreakdown = members.map((member) => {
      const priorityCounts = member.tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusCounts = member.tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        ...member,
        tasksByPriority: priorityCounts,
        tasksByStatus: statusCounts,
      };
    });

    return NextResponse.json(membersWithBreakdown);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch members');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const body = await request.json();
    const validated = memberSchema.parse(body);

    const member = await prisma.member.create({
      data: { ...validated, workspaceId: ctx.workspace.id },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to create member');
  }
}