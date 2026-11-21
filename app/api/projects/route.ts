import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get('stats') === 'true';

    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: {
            status: true,
            assignee: {
              select: { id: true, name: true, avatar: true, color: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const projectsWithMembers = projects.map((project) => {
      const members = new Map<string, { id: string; name: string; avatar: string | null; color: string }>();

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
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = projectSchema.parse(body);

    let workspaceId = (body as { workspaceId?: string }).workspaceId;
    if (!workspaceId) {
      const ws = await prisma.workspace.findFirst();
      if (!ws) {
        const created = await prisma.workspace.create({ data: { name: 'Default', slug: 'default' } });
        workspaceId = created.id;
      } else {
        workspaceId = ws.id;
      }
    }

    const project = await prisma.project.create({
      data: { ...validated, workspaceId },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input', errors: error }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create project' }, { status: 500 });
  }
}