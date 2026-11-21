import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberSchema } from '@/lib/validations';

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: { priority: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const membersWithBreakdown = members.map((member) => {
      const priorityCounts = member.tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusCounts = member.tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        ...member,
        tasksByPriority: priorityCounts,
        tasksByStatus: statusCounts,
      };
    });

    return NextResponse.json(membersWithBreakdown);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ message: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = memberSchema.parse(body);

    const member = await prisma.member.create({
      data: validated,
      include: {
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input', errors: error }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create member' }, { status: 500 });
  }
}