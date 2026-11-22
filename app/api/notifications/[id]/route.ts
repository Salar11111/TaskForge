import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(request.headers);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const read = typeof body.read === 'boolean' ? body.read : true;
    const updated = await prisma.notification.updateMany({ where: { id, userId: session.user.id }, data: { read } });
    if (updated.count === 0) return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to update notification');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(request.headers);
    const { id } = await params;
    const deleted = await prisma.notification.deleteMany({ where: { id, userId: session.user.id } });
    if (deleted.count === 0) return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to delete notification');
  }
}
