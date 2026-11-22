import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkspaceTask } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  try {
    const { id, attachmentId } = await params;
    const { ctx } = await getWorkspaceTask(request, id);
    const deleted = await prisma.attachment.deleteMany({ where: { id: attachmentId, taskId: id } });
    if (deleted.count === 0) return NextResponse.json({ message: 'Attachment not found' }, { status: 404 });
    await prisma.activityLog.create({
      data: { action: 'removed attachment', taskId: id, actorId: ctx.session.user.id },
    });
    publish('task.updated', ctx.workspace.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to remove attachment');
  }
}
