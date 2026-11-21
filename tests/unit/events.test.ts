import { describe, expect, it } from 'vitest';
import { publish, subscribe } from '@/lib/events';

describe('workspace event bus', () => {
  it('delivers only workspace-scoped events and honors unsubscribe', () => {
    const seen: string[] = [];
    const off = subscribe('ws-a', (e) => seen.push(e.type));

    publish('task.created', 'ws-b'); // other workspace
    expect(seen).toEqual([]);

    publish('task.deleted', 'ws-a');
    publish('task.created', 'ws-a');
    expect(seen).toEqual(['task.deleted', 'task.created']);

    off();
    publish('task.updated', 'ws-a');
    expect(seen).toHaveLength(2);
  });
});
