import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Central error mapping for API routes.
 *
 * Previously every route returned `500` for everything, including client
 * mistakes: malformed JSON bodies, foreign-key violations (e.g. an unknown
 * `projectId` or `assigneeId`), duplicate emails, and unknown ids on delete or
 * reorder. This mapper turns those into the status codes clients expect:
 *
 * - Zod validation errors      -> 400 with the issues attached
 * - Invalid JSON body          -> 400
 * - Prisma P2002 (unique clash)-> 409
 * - Prisma P2003/P2022/P2024   -> 400 (foreign key, missing schema field, ...)
 * - Prisma P2025 (not found)   -> 404
 * - WorkspaceError             -> its status (401/403)
 * - anything else              -> 500
 */

export class WorkspaceError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'WorkspaceError';
  }
}

function prismaStatus(error: Error): number | null {
  const code = (error as { code?: string }).code;
  if (!code) return null;
  switch (code) {
    case 'P2002':
      return 409;
    case 'P2003':
    case 'P2022':
    case 'P2024':
      return 400;
    case 'P2025':
      return 404;
    default:
      return null;
  }
}

export function apiErrorResponse(error: unknown, message = 'Internal server error') {
  // Expected 4xx inputs are routine; only log unexpected errors with a stack.
  const expected = error instanceof WorkspaceError || error instanceof ZodError || error instanceof SyntaxError || prismaStatus(error as Error) !== null;
  if (!expected) console.error('API error:', error);

  if (error instanceof WorkspaceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ message: 'Invalid input', errors: error.issues }, { status: 400 });
  }
  if (error instanceof SyntaxError) {
    // Thrown by request.json() on malformed or empty bodies
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }
  const prismaStatusCode = prismaStatus(error as Error);
  if (prismaStatusCode) {
    return NextResponse.json({ message: message || 'Invalid request' }, { status: prismaStatusCode });
  }
  return NextResponse.json({ message }, { status: 500 });
}
