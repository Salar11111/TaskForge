import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

test('sign up, onboard a workspace, and land on the dashboard', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const prisma = new PrismaClient();

  try {
    await page.goto('/signup');
    await page.getByLabel('Name').fill('E2E New User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForURL(/\/setup$/, { timeout: 15_000 });
    await expect(page.getByText('Welcome to TaskForge')).toBeVisible();

    await page.getByLabel('Workspace name').fill('E2E Workspace');
    await page.getByRole('button', { name: 'Create workspace' }).click();
    await page.waitForURL('http://localhost:3100/', { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  } finally {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.workspace.deleteMany({ where: { name: 'E2E Workspace' } });
    await prisma.$disconnect();
  }
});
