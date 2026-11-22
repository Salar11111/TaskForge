import { prisma } from '@/lib/prisma';
import { publish } from '@/lib/events';

/** Notify a task assignee (unless they made the change themselves). */
export async function notifyAssignee(
  assigneeId: string | null | undefined,
  actorId: string,
  taskId: string,
  title: string,
  workspaceId: string,
) {
  if (!assigneeId || assigneeId === actorId) return null;
  const notification = await prisma.notification.create({
    data: { userId: assigneeId, type: 'assigned', message: `You were assigned to "${title}"`, taskId },
  });
  publish('notification.created', workspaceId);
  return notification;
}
