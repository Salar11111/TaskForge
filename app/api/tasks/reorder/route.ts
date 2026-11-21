import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskReorderSchema } from '@/lib/validations';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = taskReorderSchema.parse(body);

    await prisma.$transaction(
      validated.tasks.map((task) =>
        prisma.task.update({
          where: { id: task.id },
          data: { status: task.status, order: task.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input', errors: error }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to reorder tasks' }, { status: 500 });
  }
}