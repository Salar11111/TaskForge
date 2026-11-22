import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWorkspaceTask } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';
import { z } from 'zod';

const commentSchema = z.object({ body: z.string().min(1).max(2000) });
const authorSelect = { id: true, name: true, image: true, color: true } as const;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await getWorkspaceTask(request, id);
    const comments = await prisma.comment.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: authorSelect } },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch comments');
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { ctx } = await getWorkspaceTask(request, id);
    const { body } = commentSchema.parse(await request.json());
    const comment = await prisma.comment.create({
      data: { body, taskId: id, authorId: ctx.session.user.id },
      include: { author: { select: authorSelect } },
    });
    await prisma.activityLog.create({
      data: { action: 'commented', meta: 'Added a comment', taskId: id, actorId: ctx.session.user.id },
    });
    publish('task.updated', ctx.workspace.id);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to add comment');
  }
}
