import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request.headers);
    const userId = session.user.id;
    const [persisted, dueTasks] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.task.findMany({
        where: { assigneeId: userId, status: { not: 'DONE' }, deletedAt: null, dueDate: { lte: new Date(Date.now() + 48 * 60 * 60 * 1000) } },
        select: { id: true, title: true, dueDate: true },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),
    ]);

    const now = Date.now();
    const reminders = dueTasks.map((t) => {
      const overdue = new Date(t.dueDate!).getTime() < now;
      return {
        id: `reminder-${t.id}`,
        type: overdue ? 'overdue' : 'due-soon',
        message: overdue ? `Overdue: ${t.title}` : `Due soon: ${t.title}`,
        taskId: t.id,
        read: false,
        createdAt: t.dueDate,
      };
    });

    return NextResponse.json([...reminders, ...persisted].slice(0, 50));
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch notifications');
  }
}
