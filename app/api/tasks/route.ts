import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where = projectId ? { projectId } : {};

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true, color: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = taskSchema.parse(body);

    const maxOrder = await prisma.task.aggregate({
      where: { projectId: validated.projectId, status: validated.status },
      _max: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true, color: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input', errors: error }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create task' }, { status: 500 });
  }
}