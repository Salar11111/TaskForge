import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();

async function main() {
  // Seeding is destructive. Require an explicit opt-in in production.
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    throw new Error('Refusing to seed a production database without --force');
  }

  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: { name: 'TaskForge', slug: 'taskforge' },
  });

  // Workspace owner: signs in with email/password.
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@taskforge.app').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'TaskForge-2026!';
  const adminUser =
    (await prisma.user.findUnique({ where: { email: adminEmail } })) ??
    (await prisma.user.create({ data: { name: 'TaskForge Admin', email: adminEmail, emailVerified: false, color: 'emerald' } }));
  const adminAccount = await prisma.account.findUnique({
    where: { providerId_accountId: { providerId: 'credential', accountId: adminUser.id } },
  });
  if (!adminAccount) {
    await prisma.account.create({
      data: {
        accountId: adminUser.id,
        providerId: 'credential',
        userId: adminUser.id,
        password: await hashPassword(adminPassword),
      },
    });
  }
  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: adminUser.id, workspaceId: workspace.id } },
    create: { userId: adminUser.id, workspaceId: workspace.id, role: 'OWNER' },
    update: { role: 'OWNER' },
  });

  const members = await Promise.all(
    [
      { name: 'Alex Chen', email: 'alex@taskforge.app', color: 'emerald', seed: 'alex' },
      { name: 'Sam Rivera', email: 'sam@taskforge.app', color: 'violet', seed: 'sam' },
      { name: 'Jordan Kim', email: 'jordan@taskforge.app', color: 'amber', seed: 'jordan' },
      { name: 'Taylor Brooks', email: 'taylor@taskforge.app', color: 'rose', seed: 'taylor' },
      { name: 'Morgan Lee', email: 'morgan@taskforge.app', color: 'cyan', seed: 'morgan' },
    ].map(async (m) => {
      const user = await prisma.user.create({
        data: {
          name: m.name,
          email: m.email,
          color: m.color,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.seed}`,
        },
      });
      await prisma.workspaceMember.create({
        data: { userId: user.id, workspaceId: workspace.id, role: 'MEMBER' },
      });
      return user;
    }),
  );

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Website Redesign',
        description: 'Complete overhaul of the marketing website with new branding',
        color: 'emerald',
        workspaceId: workspace.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App',
        description: 'Native iOS and Android app for task management on the go',
        color: 'violet',
        workspaceId: workspace.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'API v2',
        description: 'Next-generation REST API with GraphQL gateway',
        color: 'amber',
        workspaceId: workspace.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Analytics Dashboard',
        description: 'Real-time analytics and reporting dashboard for customers',
        color: 'rose',
        workspaceId: workspace.id,
      },
    }),
  ]);

  const now = new Date();
  const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const tasks = [
    { title: 'Design new hero section', description: 'Create mockups for the new landing page hero', status: 'DONE', priority: 'HIGH', order: 0, projectId: projects[0].id, assigneeId: members[0].id, dueDate: addDays(-2) },
    { title: 'Implement responsive navigation', description: 'Mobile-first nav with hamburger menu', status: 'DONE', priority: 'MEDIUM', order: 1, projectId: projects[0].id, assigneeId: members[1].id, dueDate: addDays(-1) },
    { title: 'Set up Tailwind 4 configuration', description: 'Configure design tokens and color palette', status: 'IN_PROGRESS', priority: 'HIGH', order: 0, projectId: projects[0].id, assigneeId: members[2].id, dueDate: addDays(1) },
    { title: 'Create component library', description: 'Build reusable UI components with shadcn/ui', status: 'IN_PROGRESS', priority: 'MEDIUM', order: 1, projectId: projects[0].id, assigneeId: members[3].id, dueDate: addDays(3) },
    { title: 'Write documentation', description: 'Document component APIs and usage examples', status: 'TODO', priority: 'LOW', order: 2, projectId: projects[0].id, assigneeId: members[4].id, dueDate: addDays(-2) },
    { title: 'Design onboarding flow', description: 'User onboarding screens and interactions', status: 'REVIEW', priority: 'HIGH', order: 0, projectId: projects[1].id, assigneeId: members[1].id, dueDate: addDays(2) },
    { title: 'Implement push notifications', description: 'Local and remote push notification system', status: 'IN_PROGRESS', priority: 'HIGH', order: 1, projectId: projects[1].id, assigneeId: members[0].id, dueDate: addDays(4) },
    { title: 'Build offline sync', description: 'Local-first data sync with conflict resolution', status: 'TODO', priority: 'URGENT', order: 2, projectId: projects[1].id, assigneeId: members[2].id, dueDate: addDays(10) },
    { title: 'App Store submission', description: 'Prepare screenshots, metadata, and submit for review', status: 'TODO', priority: 'MEDIUM', order: 3, projectId: projects[1].id, assigneeId: members[3].id, dueDate: addDays(14) },
    { title: 'Design GraphQL schema', description: 'Define types, queries, mutations for v2 API', status: 'DONE', priority: 'HIGH', order: 0, projectId: projects[2].id, assigneeId: members[2].id, dueDate: addDays(-3) },
    { title: 'Implement authentication', description: 'JWT-based auth with refresh tokens', status: 'IN_PROGRESS', priority: 'URGENT', order: 1, projectId: projects[2].id, assigneeId: members[0].id, dueDate: addDays(1) },
    { title: 'Add rate limiting', description: 'Per-client rate limits with Redis backend', status: 'REVIEW', priority: 'MEDIUM', order: 2, projectId: projects[2].id, assigneeId: members[4].id, dueDate: addDays(5) },
    { title: 'Write API docs', description: 'OpenAPI spec and developer guide', status: 'TODO', priority: 'LOW', order: 3, projectId: projects[2].id, assigneeId: members[1].id, dueDate: addDays(10) },
    { title: 'Design dashboard layout', description: 'Wireframes for analytics dashboard', status: 'DONE', priority: 'MEDIUM', order: 0, projectId: projects[3].id, assigneeId: members[3].id, dueDate: addDays(-5) },
    { title: 'Build chart components', description: 'Reusable chart library with recharts', status: 'IN_PROGRESS', priority: 'HIGH', order: 1, projectId: projects[3].id, assigneeId: members[4].id, dueDate: addDays(2) },
    { title: 'Implement real-time updates', description: 'WebSocket integration for live data', status: 'TODO', priority: 'HIGH', order: 2, projectId: projects[3].id, assigneeId: members[0].id, dueDate: addDays(8) },
    { title: 'Add export functionality', description: 'PDF and CSV export for reports', status: 'TODO', priority: 'MEDIUM', order: 3, projectId: projects[3].id, assigneeId: members[1].id, dueDate: addDays(12) },
    { title: 'Set up CI/CD pipeline', description: 'Automated testing and deployment', status: 'REVIEW', priority: 'HIGH', order: 4, projectId: projects[3].id, assigneeId: members[2].id, dueDate: addDays(3) },
    { title: 'Performance audit', description: 'Lighthouse audit and optimization', status: 'TODO', priority: 'LOW', order: 5, projectId: projects[3].id, assigneeId: members[3].id, dueDate: addDays(15) },
  ];

  const createdTasks = [];
  for (const task of tasks) {
    createdTasks.push(await prisma.task.create({ data: task }));
  }

  // --- P5 sample data so task details, labels, sprints and trash are populated ---
  const [designLabel, bugLabel] = await Promise.all([
    prisma.label.create({ data: { name: 'Design', color: 'violet', workspaceId: workspace.id } }),
    prisma.label.create({ data: { name: 'Bug', color: 'rose', workspaceId: workspace.id } }),
  ]);

  const sprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 1',
      goal: 'Ship the first incremental release',
      workspaceId: workspace.id,
      startDate: addDays(-7),
      endDate: addDays(7),
    },
  });

  const firstTask = createdTasks[0];
  await prisma.taskLabel.createMany({
    data: [
      { taskId: firstTask.id, labelId: designLabel.id },
      { taskId: createdTasks[1].id, labelId: bugLabel.id },
    ],
  });
  await prisma.task.update({
    where: { id: createdTasks[1].id },
    data: { sprintId: sprint.id },
  });

  await prisma.comment.create({
    data: { body: 'Looks good — ready for review.', taskId: firstTask.id, authorId: adminUser.id },
  });
  await prisma.activityLog.create({
    data: { action: 'updated task', meta: 'status', taskId: firstTask.id, actorId: adminUser.id },
  });
  await prisma.attachment.create({
    data: {
      name: 'Design brief',
      url: 'https://example.com/design-brief.pdf',
      taskId: firstTask.id,
      uploaderId: adminUser.id,
    },
  });
  await prisma.notification.create({
    data: { userId: adminUser.id, type: 'info', message: 'Welcome to TaskForge' },
  });
  await prisma.task.create({
    data: {
      title: 'Archived draft',
      description: 'Soft-deleted example for the trash view',
      status: 'TODO',
      priority: 'LOW',
      order: 99,
      projectId: projects[0].id,
      deletedAt: addDays(-1),
    },
  });

  console.log(`Database seeded successfully! Admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });