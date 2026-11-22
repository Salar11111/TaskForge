import { NextRequest } from 'next/server';
import { requireWorkspace } from '@/lib/authz';
import { apiErrorResponse } from '@/lib/api-error';
import { subscribe } from '@/lib/events';

export async function GET(request: NextRequest) {
  let unsubscribe: (() => void) | undefined;
  let closeStream: (() => void) | undefined;

  try {
    const ctx = await requireWorkspace(request);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const send = (payload: unknown) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          } catch {
            // The client disconnected; cleanup runs via abort/cancel.
          }
        };

        send({ type: 'connected' });
        unsubscribe = subscribe(ctx.workspace.id, send);

        const interval = setInterval(() => send({ type: 'ping' }), 30_000);
        const close = () => {
          clearInterval(interval);
          unsubscribe?.();
          unsubscribe = undefined;
        };
        closeStream = close;
        request.signal.addEventListener('abort', close);
        request.signal.addEventListener('abort', () => {
          try { controller.close(); } catch { /* already closed */ }
        });
      },
      cancel() {
        closeStream?.();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    unsubscribe?.();
    return apiErrorResponse(error);
  }
}
