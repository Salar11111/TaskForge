import { expect, test, request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';

const BASE = 'http://localhost:3100';
const PASSWORD = 'Security-Test-2026!';

const created = { userIds: [] as string[], workspaceIds: [] as string[], projectIds: [] as string[], taskIds: [] as string[] };

async function createUser(prisma: PrismaClient, email: string, memberships: Array<[string, 'OWNER' | 'ADMIN' | 'MEMBER']>) {
  const user = await prisma.user.create({ data: { email, name: email.split('@')[0], color: 'slate' } });
  created.userIds.push(user.id);
  await prisma.account.create({
    data: { accountId: user.id, providerId: 'credential', userId: user.id, password: await hashPassword(PASSWORD) },
  });
  for (const [workspaceId, role] of memberships) {
    await prisma.workspaceMember.create({ data: { userId: user.id, workspaceId, role } });
  }
  return user;
}

let ipCounter = 0;

async function signIn(email: string, headers: Record<string, string> = {}): Promise<APIRequestContext> {
  const ctx = await playwrightRequest.newContext({ baseURL: BASE });
  // Each sign-in gets its own source IP so the auth limiter doesn't couple tests.
  const ip = `198.51.100.${++ipCounter}`;
  const response = await ctx.post('/api/auth/sign-in/email', {
    headers: { 'x-forwarded-for': ip, ...headers },
    data: { email, password: email === 'admin@taskforge.app' ? 'TaskForge-2026!' : PASSWORD },
  });
  expect(response.ok(), `sign in as ${email}: ${await response.text()}`).toBeTruthy();
  return ctx;
}

test.describe('authorization and workspace isolation', () => {
  let prisma: PrismaClient;
  let wsA: { id: string };
  let wsB: { id: string };
  let admin: Awaited<ReturnType<PrismaClient['user']['findUniqueOrThrow']>>;
  let member: Awaited<ReturnType<PrismaClient['user']['findUniqueOrThrow']>>;
  let projectBId: string;

  test.beforeAll(async () => {
    prisma = new PrismaClient();
    wsA = await prisma.workspace.findFirstOrThrow({ where: { slug: 'taskforge' } });
    wsB = await prisma.workspace.create({ data: { name: 'Security Test B', slug: 'security-test-b' } });
    created.workspaceIds.push(wsB.id);
    admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@taskforge.app' } });
    await createUser(prisma, 'sec-owner-b@taskforge.app', [[wsB.id, 'OWNER'], [wsA.id, 'MEMBER']]);
    member = await createUser(prisma, 'sec-member-a@taskforge.app', [[wsA.id, 'MEMBER']]);
    const projectB = await prisma.project.create({ data: { name: 'Security Project B', workspaceId: wsB.id, color: 'slate' } });
    created.projectIds.push(projectB.id);
    projectBId = projectB.id;
  });

  test.afterAll(async () => {
    await prisma.session.deleteMany({ where: { userId: { in: created.userIds } } });
    await prisma.task.deleteMany({ where: { id: { in: created.taskIds } } });
    await prisma.project.deleteMany({ where: { id: { in: created.projectIds } } });
    await prisma.workspaceMember.deleteMany({ where: { userId: { in: created.userIds } } });
    await prisma.account.deleteMany({ where: { userId: { in: created.userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
    await prisma.workspace.deleteMany({ where: { id: { in: created.workspaceIds } } });
    await prisma.$disconnect();
  });

  test('cannot move a task into a project in another workspace', async () => {
    const projectA = await prisma.project.findFirstOrThrow({ where: { workspaceId: wsA.id } });
    const task = await prisma.task.create({
      data: { title: 'IDOR relocation', status: 'TODO', priority: 'MEDIUM', projectId: projectA.id, order: 999 },
    });
    created.taskIds.push(task.id);
    const adminCtx = await signIn('admin@taskforge.app');
    const response = await adminCtx.patch(`/api/tasks/${task.id}`, { data: { projectId: projectBId } });
    expect(response.status()).toBe(404);
    const after = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(after.projectId).toBe(projectA.id);
    await adminCtx.dispose();
  });

  test('user task stats are scoped to the current workspace', async () => {
    const shared = await prisma.user.findUniqueOrThrow({ where: { email: 'sec-owner-b@taskforge.app' } });
    const task = await prisma.task.create({
      data: { title: 'WS-B only', status: 'TODO', priority: 'LOW', projectId: projectBId, assigneeId: shared.id, order: 999 },
    });
    created.taskIds.push(task.id);
    const adminCtx = await signIn('admin@taskforge.app');
    const response = await adminCtx.get('/api/users');
    expect(response.ok()).toBeTruthy();
    const users = await response.json();
    const entry = users.find((u: { id: string }) => u.id === shared.id);
    expect(entry.taskCount).toBe(0);
    await adminCtx.dispose();
  });

  test('a MEMBER cannot delete an OWNER', async () => {
    const memberCtx = await signIn('sec-member-a@taskforge.app');
    const response = await memberCtx.delete(`/api/users/${admin.id}`);
    expect(response.status()).toBe(403);
    expect(await prisma.user.findUnique({ where: { id: admin.id } })).not.toBeNull();
    await memberCtx.dispose();
  });

  test('an unknown workspace id is rejected instead of silently falling back', async () => {
    const adminCtx = await signIn('admin@taskforge.app');
    const response = await adminCtx.get('/api/tasks', { headers: { 'x-workspace-id': 'not-a-workspace' } });
    expect(response.status()).toBe(403);
    await adminCtx.dispose();
  });

  test('javascript: attachment URLs are rejected', async () => {
    const projectA = await prisma.project.findFirstOrThrow({ where: { workspaceId: wsA.id } });
    const task = await prisma.task.create({
      data: { title: 'Attachment XSS', status: 'TODO', priority: 'LOW', projectId: projectA.id, order: 999 },
    });
    created.taskIds.push(task.id);
    const adminCtx = await signIn('admin@taskforge.app');
    const response = await adminCtx.post(`/api/tasks/${task.id}/attachments`, {
      data: { name: 'evil', url: 'javascript:alert(1)' },
    });
    expect(response.status()).toBe(400);
    await adminCtx.dispose();
  });
});
