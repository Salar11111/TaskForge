import { defineConfig } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: 'tests/e2e',
  webServer: {
    command: 'npm run db:push -- --skip-generate && npm run db:seed && npm run start',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 90_000,
    env: { PORT: '3100' },
  },
  use: {
    baseURL: 'http://localhost:3100',
    viewport: { width: 1280, height: 900 },
  },
  timeout: 30_000,
  fullyParallel: false,
  projects: [{ name: 'chromium' }],
});
