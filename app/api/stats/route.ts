import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET() {
  try {
    const [totalTasks, statusBreakdown, priorityBreakdown, projects, overdueTasks, upcomingTasks] = await Promise.all([
      prisma.task.count(),
      prisma.task.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.task.groupBy({ by: ['priority'], _count: { priority: true } }),
      prisma.project.findMany({
        include: {
          _count: { select: { tasks: true } },
          tasks: { select: { status: true } },
        },
      }),
      prisma.task.count({
        where: {
          dueDate: { lt: startOfDay(new Date()) },
          status: { not: 'DONE' },
        },
      }),
      prisma.task.findMany({
        where: {
          dueDate: {
            gte: startOfDay(new Date()),
            lte: addDays(startOfDay(new Date()), 7),
          },
          status: { not: 'DONE' },
        },
        include: {
          project: { select: { name: true } },
          assignee: { select: { name: true, avatar: true, color: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
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
      upcomingDeadlines: upcomingTasks.map((task) => ({
        id: task.id,
        title: task.title,
        projectName: task.project.name,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        overdue: false,
        assignee: task.assignee,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
  }
}
