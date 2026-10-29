import { describe, expect, it } from 'vitest';
import { analyse } from '../solver';
import { validate } from '../validate';
import { chapters } from './index';

// The rubric's automatic checks. Every chapter must pass these before it's merged.
// Deliberately prints no solutions: the output is safe for authors to read.
describe.each(chapters.map((c) => [c.id, c] as const))('chapter %s', (_, chapter) => {
  it('has no typos (items, flags, scenes, speakers)', () => {
    expect(validate(chapter)).toEqual([]);
  });

  const analysis = analyse(chapter);

  it('can be finished', () => {
    expect(analysis.solvable).toBe(true);
  });

  it('has no dead ends: from anywhere, the player can still finish', () => {
    expect(analysis.deadEnds).toBe(0);
  });

  it('can reach every puzzle', () => {
    expect(analysis.unreachablePuzzles).toEqual([]);
  });

  it('has unique chapter ids and numbers', () => {
    expect(chapters.filter((c) => c.id === chapter.id || c.number === chapter.number)).toHaveLength(1);
  });
});
