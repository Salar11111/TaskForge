import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userSchema } from '@/lib/validations';
import { requireWorkspace, requireWorkspaceRole, WorkspaceError } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { publish } from '@/lib/events';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await requireWorkspace(request);
    const { id } = await params;
    const user = await prisma.user.findFirst({
      where: { id, memberships: { some: { workspaceId: ctx.workspace.id } } },
      include: { memberships: { where: { workspaceId: ctx.workspace.id }, select: { id: true, role: true, createdAt: true } } },
    });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to fetch user');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await requireWorkspace(request);
    await requireWorkspaceRole(ctx, 'ADMIN');
    const { id } = await params;
    const body = await request.json();
    const validated = userSchema.partial().parse(body);

    const updated = await prisma.user.updateMany({
      where: { id, memberships: { some: { workspaceId: ctx.workspace.id } } },
      data: validated,
    });
    if (updated.count === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const user = await prisma.user.findFirst({
      where: { id, memberships: { some: { workspaceId: ctx.workspace.id } } },
      include: { memberships: { where: { workspaceId: ctx.workspace.id }, select: { id: true, role: true, createdAt: true } } },
    });
    publish('user.updated', ctx.workspace.id);
    return NextResponse.json(user);
  } catch (error) {
    return apiErrorResponse(error, 'Failed to update user');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await requireWorkspace(request);
    await requireWorkspaceRole(ctx, 'ADMIN');
    const { id } = await params;

    // Never remove the last owner of a workspace.
    const targetMembership = await prisma.workspaceMember.findFirst({
      where: { userId: id, workspaceId: ctx.workspace.id },
    });
    if (targetMembership?.role === 'OWNER') {
      const ownerCount = await prisma.workspaceMember.count({
        where: { workspaceId: ctx.workspace.id, role: 'OWNER' },
      });
      if (ownerCount <= 1) throw new WorkspaceError(400, 'Cannot remove the last workspace owner');
    }

    const deleted = await prisma.user.deleteMany({
      where: { id, memberships: { some: { workspaceId: ctx.workspace.id } } },
    });
    if (deleted.count === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    publish('user.deleted', ctx.workspace.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to delete user');
  }
}
