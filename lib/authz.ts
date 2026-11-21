import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

export async function requireSession(headers: Headers) {
  const session = await getSession(headers);
  if (!session) throw new Response('Unauthorized', { status: 401 });
  return session;
}

export async function requireWorkspaceRole(userId: string, workspaceId: string, minRole: 'MEMBER' | 'ADMIN' | 'OWNER') {
  const m = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!m) throw new Response('Forbidden', { status: 403 });
  const rank = { MEMBER: 1, ADMIN: 2, OWNER: 3 } as const;
  if (rank[m.role as keyof typeof rank] < rank[minRole]) throw new Response('Forbidden', { status: 403 });
  return m;
}