import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, getWorkspaceContext, WorkspaceError } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { rateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'workspace'
  );
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; ; i++) {
    const taken = await prisma.workspace.findUnique({ where: { slug } });
    if (!taken) return slug;
    slug = `${base}-${i}`;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request.headers);
    if (!session) throw new WorkspaceError(401, 'Unauthorized');
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: session.user.id },
      include: { workspace: { select: { id: true, name: true, slug: true } } },
      orderBy: { workspace: { createdAt: 'asc' } },
    });
    return NextResponse.json(memberships.map((m) => m.workspace));
  } catch (error) {
    return apiErrorResponse(error, 'Failed to list workspaces');
  }
}

const WORKSPACE_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export async function POST(request: NextRequest) {
  try {
    const ctx = await getWorkspaceContext(request);
    if (!ctx) throw new WorkspaceError(401, 'Unauthorized');
    if (!rateLimit(`ws-create:${ctx.session.user.id}`, WORKSPACE_RATE_LIMIT.limit, WORKSPACE_RATE_LIMIT.windowMs)) {
      return NextResponse.json({ message: 'Too many requests. Try again in a minute.' }, { status: 429 });
    }
    if (ctx.workspace) throw new WorkspaceError(400, 'You already belong to a workspace');

    const body = await request.json();
    const validated = workspaceSchema.parse(body);
    const slug = await uniqueSlug(validated.name);

    const workspace = await prisma.workspace.create({
      data: { name: validated.name, slug },
    });
    await prisma.workspaceMember.create({
      data: { userId: ctx.session.user.id, workspaceId: workspace.id, role: 'OWNER' },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'Failed to create workspace');
  }
}
