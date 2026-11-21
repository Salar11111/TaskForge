import { NextRequest } from 'next/server';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    await requireWorkspace(request);
  } catch (error) {
    return apiErrorResponse(error);
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode('data: {"type":"ping"}\n\n'));
      }, 30000);
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}