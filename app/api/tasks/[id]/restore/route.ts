import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const updated = await prisma.task.updateMany({
      where: { id, project: { workspaceId: ctx.workspace.id }, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    if (updated.count === 0) return NextResponse.json({ message: 'Deleted task not found' }, { status: 404 });
    publish('task.created', ctx.workspace.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to restore task');
  }
}
