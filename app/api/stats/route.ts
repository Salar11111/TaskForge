import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const today = startOfDay(new Date());
    const weekAgo = addDays(today, -7);
    const twoWeeksAgo = addDays(today, -14);
    const where = { project: { workspaceId: ctx.workspace.id }, deletedAt: null };
    // "Last week" buckets, used to compute the dashboard trends.
    const [
      totalTasks, statusBreakdown, priorityBreakdown, projects, overdueTasks, upcomingTasks,
      lastWeekCompleted, lastWeekOverdue,
    ] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.groupBy({ by: ['status'], where, _count: { status: true } }),
      prisma.task.groupBy({ by: ['priority'], where, _count: { priority: true } }),
      prisma.project.findMany({
        where: { workspaceId: ctx.workspace.id },
        include: {
          _count: { select: { tasks: { where: { deletedAt: null } } } },
          tasks: { where: { deletedAt: null }, select: { status: true } },
        },
      }),
      prisma.task.count({
        where: { ...where, dueDate: { lt: today }, status: { not: 'DONE' } },
      }),
      prisma.task.findMany({
        where: {
          ...where,
          dueDate: {
            gte: today,
            lte: addDays(today, 7),
          },
          status: { not: 'DONE' },
        },
        include: {
          project: { select: { name: true } },
          assignee: { select: { name: true, image: true, color: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      prisma.task.count({
        where: { ...where, status: 'DONE', updatedAt: { gt: twoWeeksAgo, lte: weekAgo } },
      }),
      prisma.task.count({
        where: { ...where, dueDate: { lt: weekAgo, gt: twoWeeksAgo }, status: { not: 'DONE' } },
      }),
    ]);

    const statusMap = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
    statusBreakdown.forEach((s) => { statusMap[s.status as keyof typeof statusMap] = s._count.status; });

    const priorityMap = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    priorityBreakdown.forEach((p) => { priorityMap[p.priority as keyof typeof priorityMap] = p._count.priority; });

    const projectProgress = projects.map((project) => {
      const statusCounts = project.tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        id: project.id,
        name: project.name,
        color: project.color,
        total: project._count.tasks,
        completed: statusCounts.DONE || 0,
        inProgress: statusCounts.IN_PROGRESS || 0,
        review: statusCounts.REVIEW || 0,
        todo: statusCounts.TODO || 0,
      };
    });

    return NextResponse.json({
      totalTasks,
      statusBreakdown: statusMap,
      priorityBreakdown: priorityMap,
      projectProgress,
      overdueCount: overdueTasks,
      lastWeek: { completed: lastWeekCompleted, overdue: lastWeekOverdue },
      upcomingDeadlines: upcomingTasks.map((task) => ({
        id: task.id,
        title: task.title,
        projectName: task.project.name,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        overdue: new Date(task.dueDate!) < today,
        assignee: task.assignee,
      })),
    });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch stats');
  }
}
