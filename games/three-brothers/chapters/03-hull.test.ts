import { describe, expect, it } from 'vitest';
import { analyse } from '../solver';
import { hull } from './03-hull';

// Deliberately prints no solutions: the output is safe for authors to read.
describe('hull', () => {
  it('takes more than a stroll to finish', () => {
    expect(analyse(hull).shortest).toBeGreaterThanOrEqual(25);
  });

  it('is marked in development until a brother has played it', () => {
    expect(hull.inDevelopment).toBe(true);
  });
});
