import { describe, expect, it } from 'vitest';
import { changedUpdates } from '@/lib/reorder';

describe('changedUpdates', () => {
  const original = [
    { id: 'a', status: 'TODO', order: 0 },
    { id: 'b', status: 'TODO', order: 1 },
    { id: 'c', status: 'DONE', order: 0 },
  ];

  it('returns an empty array when nothing changed', () => {
    expect(changedUpdates(original, original)).toEqual([]);
  });

  it('returns only the rows whose status or order changed', () => {
    const next = [
      { id: 'a', status: 'IN_PROGRESS', order: 0 },
      { id: 'b', status: 'TODO', order: 1 },
      { id: 'c', status: 'DONE', order: 0 },
    ];
    expect(changedUpdates(next, original)).toEqual([{ id: 'a', status: 'IN_PROGRESS', order: 0 }]);
  });

  it('includes new rows', () => {
    const next = [...original, { id: 'd', status: 'TODO', order: 2 }];
    expect(changedUpdates(next, original)).toEqual([{ id: 'd', status: 'TODO', order: 2 }]);
  });
});
