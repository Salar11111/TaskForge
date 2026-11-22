/**
 * Minimal in-memory rate limiter for API routes.
 *
 * Sufficient for the single-process production/dev deployments this app uses.
 * Callers should size `limit` generously; the window slides with the oldest
 * entry. Buckets older than the window are pruned periodically.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

let pruneTick = 0;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }
  entry.count += 1;
  buckets.set(key, entry);

  // Prune occasionally (and when the map grows large) so spoofed keys cannot
  // grow the bucket map without bound between periodic sweeps.
  if (++pruneTick % 1000 === 0 || buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (now >= v.resetAt) buckets.delete(k);
    }
  }

  return entry.count <= limit;
}

export function ipFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // A trusted proxy appends the source IP it sees, so the right-most entry is
    // the one the client cannot control. The left-most entry is client-supplied.
    const hops = forwarded.split(',').map((s) => s.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'anonymous';
}
