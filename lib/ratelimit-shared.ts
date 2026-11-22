import { prisma } from '@/lib/prisma';

/**
 * Database-backed sliding-window limiter for Node API routes. Unlike the
 * in-memory limiter, counters are shared by every process using this database,
 * so limits cannot be multiplied by running more instances.
 *
 * Resets and increments are atomic conditional updates, so concurrent requests
 * cannot double-reset or lose counts.
 */
export async function rateLimitShared(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  // Start at zero; the single increment below counts the current request.
  await prisma.rateLimitBucket.upsert({
    where: { key },
    create: { key, count: 0, resetAt },
    update: {},
  });

  await prisma.rateLimitBucket.updateMany({
    where: { key, resetAt: { lte: now } },
    data: { count: 0, resetAt },
  });

  const updated = await prisma.rateLimitBucket.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  // Opportunistic cleanup of stale buckets (1% of calls).
  if (Math.random() < 0.01) {
    await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: new Date(now.getTime() - windowMs) } } });
  }

  return updated.count <= limit;
}
