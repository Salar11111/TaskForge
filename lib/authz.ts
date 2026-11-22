import type { Workspace, WorkspaceMember } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WorkspaceError } from '@/lib/api-error';

export { WorkspaceError };

export type Session = typeof auth.$Infer.Session;

export interface WorkspaceContext {
  session: Session;
  membership: WorkspaceMember;
  workspace: Workspace;
}

export async function getSession(headers: Headers) {
  return auth.api.getSession({ headers });
}

/**
 * Resolve the caller's default workspace context.
 *
 * Every user has a "default workspace": their first workspace, or the one
 * selected via the `x-workspace-id` header if they are a member of it.
 * Returns null when there is no session, and a context with a null
 * `workspace` when the user has no workspace yet.
 */
export async function getWorkspaceContext(request: Request): Promise<
  | { session: Session; membership: WorkspaceMember | null; workspace: Workspace | null }
  | null
> {
  const headers = new Headers(request.headers);
  const session = await getSession(headers);
  if (!session) return null;

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: { workspace: { select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true } } },
    orderBy: [{ workspace: { createdAt: 'asc' } }, { createdAt: 'asc' }],
  });

  // EventSource cannot set custom headers, so also accept a query parameter.
  const queryWorkspaceId = new URL(request.url).searchParams.get('workspaceId');
  const requestedId = headers.get('x-workspace-id') ?? queryWorkspaceId;
  const match = requestedId ? memberships.find((m) => m.workspace.id === requestedId) : undefined;
  if (requestedId && !match) {
    throw new WorkspaceError(403, 'Not a member of the requested workspace');
  }
  const membership = match ?? memberships[0] ?? null;

  return { session, membership, workspace: membership?.workspace ?? null };
}

/**
 * Require a signed-in caller and a default workspace. Throws a 401 when
 * anonymous, a 403 when the user belongs to no workspace.
 */
export async function requireWorkspace(request: Request): Promise<WorkspaceContext> {
  const ctx = await getWorkspaceContext(request);
  if (!ctx) throw new WorkspaceError(401, 'Unauthorized');
  if (!ctx.membership || !ctx.workspace) {
    throw new WorkspaceError(403, 'You are not a member of any workspace');
  }
  return ctx as WorkspaceContext;
}

/** Resolve a task that belongs to the caller's workspace, or throw 404. */
export async function getWorkspaceTask(request: Request, taskId: string) {
  const ctx = await requireWorkspace(request);
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { workspaceId: ctx.workspace.id } },
    select: { id: true, title: true, status: true, assigneeId: true, projectId: true },
  });
  if (!task) throw new WorkspaceError(404, 'Task not found');
  return { ctx, task };
}

export async function requireSession(headers: Headers) {
  const session = await getSession(headers);
  if (!session) throw new WorkspaceError(401, 'Unauthorized');
  return session;
}

export async function requireWorkspaceRole(
  ctx: WorkspaceContext,
  minRole: 'MEMBER' | 'ADMIN' | 'OWNER'
) {
  const rank = { MEMBER: 1, ADMIN: 2, OWNER: 3 } as const;
  const role = ctx.membership.role as keyof typeof rank;
  if (rank[role] < rank[minRole]) {
    throw new WorkspaceError(403, 'Insufficient permissions');
  }
  return ctx.membership;
}
