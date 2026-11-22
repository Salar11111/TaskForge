import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkspaceTask } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await getWorkspaceTask(request, id);
    const activity = await prisma.activityLog.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { actor: { select: { id: true, name: true, image: true, color: true } } },
    });
    return NextResponse.json(activity);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch activity');
  }
}
