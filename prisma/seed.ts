import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.member.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: { name: 'TaskForge', slug: 'taskforge' },
  });

  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: 'Alex Chen',
        email: 'alex@taskforge.app',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        color: 'emerald',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Sam Rivera',
        email: 'sam@taskforge.app',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam',
        color: 'violet',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Jordan Kim',
        email: 'jordan@taskforge.app',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
        color: 'amber',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Taylor Brooks',
        email: 'taylor@taskforge.app',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=taylor',
        color: 'rose',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Morgan Lee',
        email: 'morgan@taskforge.app',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morgan',
        color: 'cyan',
      },
    }),
  ]);

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
    { title: 'Write documentation', description: 'Document component APIs and usage examples', status: 'TODO', priority: 'LOW', order: 2, projectId: projects[0].id, assigneeId: members[4].id, dueDate: addDays(7) },
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

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });