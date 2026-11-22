import { afterAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { rateLimitShared } from '@/lib/ratelimit-shared';

const prisma = new PrismaClient();
const key = `test:${Date.now()}:${Math.random()}`;

afterAll(async () => {
  await prisma.rateLimitBucket.deleteMany({ where: { key } });
  await prisma.$disconnect();
});

describe('rateLimitShared — database-backed limiter', () => {
  it('allows up to the limit, then blocks, then resets after the window', async () => {
    expect(await rateLimitShared(key, 2, 5_000)).toBe(true);
    expect(await rateLimitShared(key, 2, 5_000)).toBe(true);
    expect(await rateLimitShared(key, 2, 5_000)).toBe(false);

    // Force expiry and verify the bucket resets atomically.
    await prisma.rateLimitBucket.update({ where: { key }, data: { resetAt: new Date(Date.now() - 1) } });
    expect(await rateLimitShared(key, 2, 5_000)).toBe(true);
  });
});