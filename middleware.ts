import { NextRequest, NextResponse } from 'next/server';
import { ipFromRequest, rateLimit } from '@/lib/ratelimit';

const DATA_API_LIMIT = 200; // per IP per method per minute
const WINDOW_MS = 60_000;

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/api/')) return NextResponse.next();

  // Auth routes have their own stricter limiter; SSE connections are long-lived.
  if (path.startsWith('/api/auth/') || path === '/api/realtime') return NextResponse.next();

  const key = `data-api:${ipFromRequest(request)}:${request.method}`;
  if (!rateLimit(key, DATA_API_LIMIT, WINDOW_MS)) {
    return NextResponse.json({ message: 'Too many requests. Try again in a minute.' }, { status: 429 });
  }
  return NextResponse.next();
}

export const config = { matcher: ['/api/:path*'] };
