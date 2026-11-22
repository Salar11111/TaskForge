import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { z } from 'zod';

const sprintSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  goal: z.string().max(500).optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const body = sprintSchema.parse(await request.json());
    const existing = await prisma.sprint.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
    if (!existing) return NextResponse.json({ message: 'Sprint not found' }, { status: 404 });
    const sprint = await prisma.sprint.update({
      where: { id },
      data: {
        ...body,
        ...(body.startDate ? { startDate: new Date(body.startDate) } : {}),
        ...(body.endDate ? { endDate: new Date(body.endDate) } : {}),
      },
    });
    return NextResponse.json(sprint);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to update sprint');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const deleted = await prisma.sprint.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
    if (deleted.count === 0) return NextResponse.json({ message: 'Sprint not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to delete sprint');
  }
}
