import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkspaceTask } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';
import { z } from 'zod';

const attachmentSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url(),
  size: z.number().int().nonnegative().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await getWorkspaceTask(request, id);
    const attachments = await prisma.attachment.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(attachments);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch attachments');
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { ctx } = await getWorkspaceTask(request, id);
    const data = attachmentSchema.parse(await request.json());
    const attachment = await prisma.attachment.create({
      data: { ...data, taskId: id, uploaderId: ctx.session.user.id },
    });
    await prisma.activityLog.create({
      data: { action: 'attached', meta: data.name, taskId: id, actorId: ctx.session.user.id },
    });
    publish('task.updated', ctx.workspace.id);
    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to add attachment');
  }
}
