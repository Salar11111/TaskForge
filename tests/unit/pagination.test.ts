import { describe, expect, it } from 'vitest';
import { parsePagination } from '@/lib/pagination';

describe('parsePagination', () => {
  it('defaults to limit=500 offset=0', () => {
    expect(parsePagination(new URLSearchParams())).toEqual({ limit: 500, offset: 0 });
  });

  it('parses valid values', () => {
    expect(parsePagination(new URLSearchParams('limit=5&offset=10'))).toEqual({ limit: 5, offset: 10 });
  });

  it('rejects invalid values', () => {
    expect(() => parsePagination(new URLSearchParams('limit=abc'))).toThrow();
    expect(() => parsePagination(new URLSearchParams('limit=0'))).toThrow();
    expect(() => parsePagination(new URLSearchParams('offset=-1'))).toThrow();
    expect(() => parsePagination(new URLSearchParams('limit=1000'))).toThrow();
  });
});
