/**
 * In-process, workspace-scoped event bus for Server-Sent Events.
 *
 * Works for a single Node process (dev and `next start`). A multi-instance
 * deployment would need to swap `publish` for a shared pub/sub (Redis, etc.).
 */
export type AppEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted';

export interface AppEvent {
  type: AppEventType;
  workspaceId: string;
  at: string;
}

type Listener = (event: AppEvent) => void;

const listeners = new Map<string, Set<Listener>>();

export function publish(type: AppEventType, workspaceId: string): void {
  const set = listeners.get(workspaceId);
  if (!set) return;
  const event: AppEvent = { type, workspaceId, at: new Date().toISOString() };
  for (const listener of [...set]) {
    try {
      listener(event);
    } catch {
      // A broken listener must not break the request that published the event.
    }
  }
}

export function subscribe(workspaceId: string, listener: Listener): () => void {
  const set = listeners.get(workspaceId) ?? new Set<Listener>();
  set.add(listener);
  listeners.set(workspaceId, set);
  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(workspaceId);
  };
}
