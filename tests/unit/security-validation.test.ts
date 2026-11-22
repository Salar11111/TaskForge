import { describe, expect, it } from 'vitest';
import { taskSchema, taskReorderSchema, userSchema } from '@/lib/validations';

const validTask = {
  title: 'Test task',
  status: 'TODO',
  priority: 'MEDIUM',
  projectId: 'project-1',
};

describe('security regression — validation', () => {
  it('accepts assigneeId: null so tasks can be unassigned', () => {
    const parsed = taskSchema.parse({ ...validTask, assigneeId: null });
    expect(parsed.assigneeId).toBeNull();
  });

  it('still accepts an assignee id and an omitted assignee', () => {
    expect(taskSchema.parse({ ...validTask, assigneeId: 'user-1' }).assigneeId).toBe('user-1');
    expect(taskSchema.parse(validTask).assigneeId).toBeUndefined();
  });

  it('rejects non-http avatar URLs', () => {
    expect(() => userSchema.parse({ name: 'A', email: 'a@b.co', color: 'slate', image: 'javascript:alert(1)' })).toThrow();
    expect(userSchema.parse({ name: 'A', email: 'a@b.co', color: 'slate', image: 'https://example.com/a.png' }).image).toBe('https://example.com/a.png');
  });

  it('bounds the reorder payload', () => {
    const tooMany = Array.from({ length: 501 }, (_, i) => ({ id: `t${i}`, status: 'TODO', order: i }));
    expect(() => taskReorderSchema.parse({ tasks: tooMany })).toThrow();
    expect(taskReorderSchema.parse({ tasks: tooMany.slice(0, 500) }).tasks).toHaveLength(500);
  });
});
