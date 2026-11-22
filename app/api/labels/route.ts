import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { z } from 'zod';

const labelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.enum(['emerald', 'violet', 'amber', 'rose', 'cyan', 'orange', 'teal', 'pink', 'sky', 'slate']).default('slate'),
});

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const labels = await prisma.label.findMany({
      where: { workspaceId: ctx.workspace.id },
      orderBy: { name: 'asc' },
      include: { _count: { select: { tasks: true } } },
    });
    return NextResponse.json(labels);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch labels');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const data = labelSchema.parse(await request.json());
    const label = await prisma.label.create({ data: { ...data, workspaceId: ctx.workspace.id } });
    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to create label');
  }
}
