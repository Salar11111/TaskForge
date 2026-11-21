import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userSchema } from '@/lib/validations';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

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
    const { id } = await params;
    const deleted = await prisma.user.deleteMany({
      where: { id, memberships: { some: { workspaceId: ctx.workspace.id } } },
    });
    if (deleted.count === 0) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to delete user');
  }
}
