import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { ipFromRequest, rateLimit } from '@/lib/ratelimit';

const { GET, POST: handlePost } = toNextJsHandler(auth);

export { GET };

// Brute-force protection on sign-in / sign-up / sign-out mutations.
const AUTH_RATE_LIMIT = { limit: 10, windowMs: 60_000 };

export async function POST(request: NextRequest) {
  if (!rateLimit(`auth-post:${ipFromRequest(request)}`, AUTH_RATE_LIMIT.limit, AUTH_RATE_LIMIT.windowMs)) {
    return NextResponse.json({ message: 'Too many requests. Try again in a minute.' }, { status: 429 });
  }
  return handlePost(request);
}
