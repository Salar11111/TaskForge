import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';
import { z } from 'zod';

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  action: z.enum(['delete', 'restore', 'status']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
}).refine((v) => v.action !== 'status' || !!v.status, { message: 'status is required' });

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const body = bulkSchema.parse(await request.json());
    const scope = { project: { workspaceId: ctx.workspace.id } };

    // Ensure every id belongs to this workspace (deleted or not) before acting.
    const found = await prisma.task.count({ where: { ...scope, id: { in: body.ids } } });
    if (found !== new Set(body.ids).size) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const where = { ...scope, id: { in: body.ids } };
    if (body.action === 'delete') {
      await prisma.task.updateMany({
        where: { ...where, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    } else if (body.action === 'restore') {
      await prisma.task.updateMany({
        where: { ...where, deletedAt: { not: null } },
        data: { deletedAt: null },
      });
    } else {
      await prisma.task.updateMany({
        where: { ...where, deletedAt: null },
        data: { status: body.status },
      });
    }

    publish('task.updated', ctx.workspace.id);
    return NextResponse.json({ success: true, affected: body.ids.length });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to apply bulk action');
  }
}
