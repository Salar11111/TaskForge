import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { colorMap } from '@/lib/colors';

const COLORS = ['emerald', 'violet', 'amber', 'rose', 'cyan', 'orange', 'teal', 'pink', 'sky', 'slate'] as const;

describe('lib/colors — static Tailwind token parity', () => {
  for (const name of COLORS) {
    it(`${name}: every token is a literal, parseable class string`, () => {
      const c = colorMap[name];
      expect(c.dot).toBe(`bg-${name}-500`);
      expect(c.badge).toBe(`bg-${name}-500/15 text-${name}-800 dark:text-${name}-300 border-${name}-500/30`);
      expect(c.bar).toBe(`bg-${name}-500`);
      expect(c.ring).toBe(`ring-${name}-500/20`);
      expect(c.soft).toBe(`bg-${name}-500/10`);
      expect(c.text).toBe(`text-${name}-700 dark:text-${name}-300`);
      expect(c.avatarBg).toBe(`bg-${name}-700 text-white`);
      expect(c.solid).toBe(`bg-${name}-500`);
      expect(c.headerBg).toBe(`bg-${name}-500/10`);
      expect(c.columnBg).toBe(`bg-${name}-500/5`);
      expect(c.border).toBe(`border-${name}-500/30`);
      expect(c.css).toMatch(/^#[0-9a-f]{6}$/i);
    });
  }

  it('lib/colors.ts contains no dynamic class construction (Tailwind emits CSS only for literals)', () => {
    const src = readFileSync(new URL('../../lib/colors.ts', import.meta.url), 'utf8');
    expect(src).not.toContain('`');
    expect(src).not.toContain('${');
  });
});
