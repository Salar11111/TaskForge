import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get('stats') === 'true';

    const projects = await prisma.project.findMany({
      where: { workspaceId: ctx.workspace.id },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: {
            status: true,
            assignee: {
              select: { id: true, name: true, image: true, color: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const projectsWithMembers = projects.map((project) => {
      const members = new Map<string, { id: string; name: string; image: string | null; color: string }>();

      project.tasks.forEach((task) => {
        if (!task.assignee) return;

        members.set(task.assignee.id, task.assignee);
      });

      return {
        ...project,
        members: Array.from(members.values()),
      };
    });

    if (stats) {
      const projectsWithStats = projectsWithMembers.map((project) => {
        const statusCounts = project.tasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          ...project,
          _count: {
            tasks: {
              total: project._count.tasks,
              completed: statusCounts.DONE || 0,
              inProgress: statusCounts.IN_PROGRESS || 0,
              review: statusCounts.REVIEW || 0,
              todo: statusCounts.TODO || 0,
            },
          },
        };
      });
      return NextResponse.json(projectsWithStats);
    }

    return NextResponse.json(projectsWithMembers);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch projects');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireWorkspace(request);
    const body = await request.json();
    const validated = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: { ...validated, workspaceId: ctx.workspace.id },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    publish('project.created', ctx.workspace.id);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to create project');
  }
}