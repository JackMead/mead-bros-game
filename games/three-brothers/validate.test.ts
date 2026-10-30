import { describe, expect, it } from 'vitest';
import type { Chapter } from './types';
import { validate } from './validate';

// A tiny made-up chapter, so the checks can be tested without touching real ones.
const base: Chapter = {
  id: 'test',
  number: 99,
  title: 'Test',
  author: 'Test',
  era: 'Now',
  place: 'Here',
  brothers: ['phil'],
  start: { scene: 'room', brother: 'phil' },
  intro: [],
  items: {},
  scenes: {
    room: { name: 'Room', description: 'A room.', placeholder: { top: '#000', bottom: '#111' }, hotspots: [], stand: { phil: [{ x: 100, y: 400 }] } },
  },
  rules: [],
  puzzles: [],
  goal: '',
  ending: [],
};

describe('validate', () => {
  it('accepts an outfit the brother has', () => {
    const chapter = structuredClone(base);
    chapter.scenes.room.stand.phil = [{ x: 100, y: 400, outfit: '1890' }];
    expect(validate(chapter)).toEqual([]);
  });

  it('flags an outfit the brother does not have', () => {
    const chapter = structuredClone(base);
    chapter.scenes.room.stand.phil = [{ x: 100, y: 400, outfit: 'spacesuit' }];
    expect(validate(chapter).join()).toContain('unknown outfit "spacesuit"');
  });
});
