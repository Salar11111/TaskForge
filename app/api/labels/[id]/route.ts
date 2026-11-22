import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { z } from 'zod';

const labelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.enum(['emerald', 'violet', 'amber', 'rose', 'cyan', 'orange', 'teal', 'pink', 'sky', 'slate']).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const data = labelSchema.parse(await request.json());
    const updated = await prisma.label.updateMany({ where: { id, workspaceId: ctx.workspace.id }, data });
    if (updated.count === 0) return NextResponse.json({ message: 'Label not found' }, { status: 404 });
    return NextResponse.json(await prisma.label.findUnique({ where: { id } }));
  } catch (error) {
    return apiErrorResponse(error, 'Failed to update label');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const deleted = await prisma.label.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
    if (deleted.count === 0) return NextResponse.json({ message: 'Label not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to delete label');
  }
}
