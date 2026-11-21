import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { apiErrorResponse, WorkspaceError } from '@/lib/api-error';
import { ipFromRequest, rateLimit } from '@/lib/ratelimit';

vi.spyOn(console, 'error').mockImplementation(() => undefined);

function prismaError(code: string): Error {
  return { name: 'PrismaClientKnownRequestError', code, message: 'prisma failure' } as unknown as Error;
}

async function statusOf(error: unknown, message = 'Fallback'): Promise<number> {
  return apiErrorResponse(error, message).status;
}

describe('apiErrorResponse — centralized status mapping', () => {
  it('maps ZodError to 400 with issues', async () => {
    const result = z.object({ name: z.string().min(1, 'Name is required') }).safeParse({ name: '' });
    expect(result.success).toBe(false);
    const error = result.error!;
    const response = apiErrorResponse(error);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Invalid input');
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.errors[0].message).toBe('Name is required');
  });

  it('maps malformed/empty JSON (SyntaxError) to 400', async () => {
    expect(await statusOf(new SyntaxError('Unexpected end of JSON input'))).toBe(400);
  });

  it('maps Prisma unique constraint (P2002) to 409', async () => {
    expect(await statusOf(prismaError('P2002'))).toBe(409);
  });

  it('maps Prisma foreign key / schema errors (P2003, P2022, P2024) to 400', async () => {
    expect(await statusOf(prismaError('P2003'))).toBe(400);
    expect(await statusOf(prismaError('P2022'))).toBe(400);
    expect(await statusOf(prismaError('P2024'))).toBe(400);
  });

  it('maps Prisma not-found (P2025) to 404', async () => {
    expect(await statusOf(prismaError('P2025'))).toBe(404);
  });

  it('passes through WorkspaceError statuses (401/403)', async () => {
    expect(await statusOf(new WorkspaceError(401, 'Unauthorized'))).toBe(401);
    expect(await statusOf(new WorkspaceError(403, 'Insufficient permissions'))).toBe(403);
    expect(await statusOf(new WorkspaceError(404, 'Task not found: missing'))).toBe(404);
  });

  it('falls back to 500 for unknown errors', async () => {
    expect(await statusOf(new Error('boom'))).toBe(500);
  });
});

describe('rateLimit', () => {
  it('allows up to the limit, then rejects until the window resets', () => {
    const key = `test-${Math.random().toString(36).slice(2)}`;
    const results = [rateLimit(key, 3, 60_000), rateLimit(key, 3, 60_000), rateLimit(key, 3, 60_000), rateLimit(key, 3, 60_000)];
    expect(results).toEqual([true, true, true, false]);
    expect(rateLimit(key, 3, 60_000)).toBe(false);
  });
});

describe('ipFromRequest', () => {
  it('extracts the client IP from forwarding headers, else anonymous', () => {
    expect(ipFromRequest(new Request('http://x/', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } }))).toBe('1.2.3.4');
    expect(ipFromRequest(new Request('http://x/', { headers: { 'x-real-ip': '9.9.9.9' } }))).toBe('9.9.9.9');
    expect(ipFromRequest(new Request('http://x/'))).toBe('anonymous');
  });
});
