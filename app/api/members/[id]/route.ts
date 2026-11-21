import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memberSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          select: { priority: true, status: true, id: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    const priorityCounts = member.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = member.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      ...member,
      tasksByPriority: priorityCounts,
      tasksByStatus: statusCounts,
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json({ message: 'Failed to fetch member' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = memberSchema.partial().parse(body);

    const member = await prisma.member.update({
      where: { id },
      data: validated,
      include: {
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input', errors: error }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ message: 'Failed to delete member' }, { status: 500 });
  }
}