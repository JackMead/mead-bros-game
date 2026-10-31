import { describe, expect, it } from 'vitest';
import { Rng, hashString, mix } from './rng';

describe('rng', () => {
  it('is deterministic for a seed', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });

  it('keeps int() within bounds', () => {
    const r = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.int(-2, 3);
      expect(v).toBeGreaterThanOrEqual(-2);
      expect(v).toBeLessThanOrEqual(3);
    }
  });

  it('hashes and mixes to stable unsigned integers', () => {
    expect(hashString('bragging-rights')).toBe(hashString('bragging-rights'));
    expect(hashString('a')).not.toBe(hashString('b'));
    expect(mix(1, 2)).toBeGreaterThanOrEqual(0);
    expect(mix(1, 2)).not.toBe(mix(2, 1));
  });
});
