import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('#email', 'admin@taskforge.app');
  await page.fill('#password', 'TaskForge-2026!');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => url.pathname === '/', { timeout: 15_000 });
}

test('create and delete a task from the board', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Board', exact: true }).first().click();
  // The board requires an explicit project selection first.
  await page.getByRole('combobox').first().click();
  await page.getByRole('option').first().click();
  await expect(page.getByRole('button', { name: 'Add task' }).first()).toBeVisible({ timeout: 15_000 });

  const title = 'E2E Smoke Task';
  await page.getByRole('button', { name: 'Add task' }).first().click();
  await page.locator('[role="dialog"] input#title').fill(title);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });

  // Clean up via the API.
  const tasks = await page.request.get('/api/tasks');
  const all = await tasks.json();
  const id = (all as Array<{ id: string; title: string }>).find((t) => t.title === title)?.id;
  if (id) await page.request.delete(`/api/tasks/${id}`);
  const after = await page.request.get('/api/tasks').then((r) => r.json());
  expect((after as Array<{ title: string }>).some((t) => t.title === title)).toBe(false);
});
