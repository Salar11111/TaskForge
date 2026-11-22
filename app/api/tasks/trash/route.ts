import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const tasks = await prisma.task.findMany({
      where: { project: { workspaceId: ctx.workspace.id }, deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      take: 50,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, image: true, color: true } },
        sprint: { select: { id: true, name: true } },
        labels: { select: { label: { select: { id: true, name: true, color: true } } } },
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch deleted tasks');
  }
}
