import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';
import { requireWorkspace, requireWorkspaceRole } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id, workspaceId: ctx.workspace.id },
      include: {
        tasks: {
          where: { deletedAt: null },
          include: {
            assignee: {
              select: { id: true, name: true, image: true, color: true },
            },
          },
          orderBy: [{ status: 'asc' }, { order: 'asc' }],
        },
        _count: { select: { tasks: { where: { deletedAt: null } } } },
      },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch project');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const body = await request.json();
    const validated = projectSchema.partial().parse(body);

    const project = await prisma.project.update({
      where: { id, workspaceId: ctx.workspace.id },
      data: validated,
      include: {
        _count: { select: { tasks: true } },
      },
    });

    publish('project.updated', ctx.workspace.id);
    return NextResponse.json(project);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to update project');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireWorkspace(request);
    await requireWorkspaceRole(ctx, 'ADMIN');
    const { id } = await params;
    await prisma.project.delete({ where: { id, workspaceId: ctx.workspace.id } });
    publish('project.deleted', ctx.workspace.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to delete project');
  }
}