import { expect, test } from '@playwright/test';

test('anonymous API access is denied', async ({ request }) => {
  expect((await request.get('/api/projects')).status()).toBe(401);
  expect((await request.get('/api/tasks')).status()).toBe(401);
  expect((await request.get('/api/members')).status()).toBe(401);
  expect((await request.get('/api/stats')).status()).toBe(401);
});

test('anonymous users see the login page at /', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign in to TaskForge' })).toBeVisible();
});

test('admin can sign in and load the dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'admin@taskforge.app');
  await page.fill('#password', 'TaskForge-2026!');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => url.pathname === '/', { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15_000 });
  const r = await page.request.get('/api/projects');
  expect(r.status()).toBe(200);
});

test('wrong password is rejected', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'admin@taskforge.app');
  await page.fill('#password', 'definitely-wrong');
  await page.click('button[type="submit"]');
  await expect(page.getByRole('alert').first()).toContainText(/invalid|password/i, { timeout: 10_000 });
  await expect(page.getByRole('heading', { name: 'Sign in to TaskForge' })).toBeVisible();
});
