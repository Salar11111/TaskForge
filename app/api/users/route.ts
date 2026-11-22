import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userSchema } from '@/lib/validations';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';
import { parsePagination } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const { searchParams } = new URL(request.url);
    const { limit, offset } = parsePagination(searchParams);
    const where = { memberships: { some: { workspaceId: ctx.workspace.id } } };
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'asc' }, take: limit, skip: offset }),
      prisma.user.count({ where }),
    ]);

    const assigned = await prisma.task.findMany({
      where: { assigneeId: { in: users.map((u) => u.id) }, deletedAt: null },
      select: { assigneeId: true, priority: true },
    });

    const stats = new Map<string, { taskCount: number; tasksByPriority: Record<string, number> }>();
    for (const t of assigned) {
      if (!t.assigneeId) continue;
      const entry = stats.get(t.assigneeId) ?? { taskCount: 0, tasksByPriority: {} };
      entry.taskCount += 1;
      entry.tasksByPriority[t.priority] = (entry.tasksByPriority[t.priority] || 0) + 1;
      stats.set(t.assigneeId, entry);
    }

    return NextResponse.json(
      users.map((u) => ({ ...u, ...(stats.get(u.id) ?? { taskCount: 0, tasksByPriority: {} }) })),
      { headers: { 'X-Total-Count': String(total) } },
    );
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch users');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const body = await request.json();
    const validated = userSchema.parse(body);

    const user = await prisma.user.create({ data: validated });
    await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId: ctx.workspace.id, role: 'MEMBER' },
    });

    publish('user.created', ctx.workspace.id);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to create user');
  }
}
