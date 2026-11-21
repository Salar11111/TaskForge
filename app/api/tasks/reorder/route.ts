import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskReorderSchema } from '@/lib/validations';
import { requireWorkspace, WorkspaceError } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const body = await request.json();
    const validated = taskReorderSchema.parse(body);

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        validated.tasks.map(async (task) => {
          const updated = await tx.task.updateMany({
            where: { id: task.id, project: { workspaceId: ctx.workspace.id } },
            data: { status: task.status, order: task.order },
          });
          if (updated.count === 0) {
            throw new WorkspaceError(404, `Task not found: ${task.id}`);
          }
        })
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to reorder tasks');
  }
}
