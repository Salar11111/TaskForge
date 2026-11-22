import { defineConfig } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: 'tests/e2e',
  webServer: {
    command: 'npm run db:push -- --skip-generate && npm run db:seed && npm run build && npm run start',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 180_000,
    env: { PORT: '3100' },
  },
  use: {
    baseURL: 'http://localhost:3100',
    viewport: { width: 1280, height: 900 },
  },
  timeout: 30_000,
  fullyParallel: false,
  workers: 1, // security.spec mutates shared DB state; keep specs isolated
  projects: [{ name: 'chromium' }],
});
