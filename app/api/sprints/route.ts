import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { z } from 'zod';

const sprintSchema = z.object({
  name: z.string().min(1).max(100),
  goal: z.string().max(500).optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine((v) => new Date(v.endDate) >= new Date(v.startDate), {
  message: 'End date must be after start date',
});

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const sprints = await prisma.sprint.findMany({
      where: { workspaceId: ctx.workspace.id },
      orderBy: { startDate: 'desc' },
      include: {
        tasks: {
          where: { deletedAt: null },
          select: { status: true, id: true },
        },
      },
    });
    return NextResponse.json(sprints.map((s) => ({
      ...s,
      taskCount: s.tasks.length,
      completed: s.tasks.filter((t) => t.status === 'DONE').length,
    })));
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch sprints');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const body = await request.json();
    const data = sprintSchema.parse(body);
    const sprint = await prisma.sprint.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        workspaceId: ctx.workspace.id,
      },
    });
    return NextResponse.json(sprint, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to create sprint');
  }
}
