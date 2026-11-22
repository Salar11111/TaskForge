import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request.headers);
    await prisma.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to mark notifications as read');
  }
}
