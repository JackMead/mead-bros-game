import { describe, expect, it } from 'vitest';
import { botRun } from './bot';
import { keyMoments, momentText, postMortem, postMortemFrom } from './postmortem';
import { newRun, step, withFloor } from './sim';
import type { Enemy, Floor, RunState, Tile } from './types';

function setup(rows: string[]): RunState {
  const tiles: Tile[] = [];
  const enemies: Enemy[] = [];
  let start = { x: 0, y: 0 };
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    tiles.push(ch === '#' ? 'wall' : 'floor');
    if (ch === '@') start = { x, y };
    if (ch === 'g') enemies.push({ id: 1, type: 'goblin', pos: { x, y }, hp: 1, intent: { type: 'none' }, tick: 0 });
  }));
  const floor: Floor = { depth: 1, width: rows[0].length, height: rows.length, tiles, start, stairs: { x: -9, y: -9 }, items: [], enemies };
  return withFloor(newRun(1), floor);
}

describe('post-mortem', () => {
  it('flags walking away from a goblin that was winding up, and names a better move', () => {
    const start = setup(['...g...', '.......', '...@...', '.......']);
    const moments = postMortemFrom(start, [{ type: 'wait' }, { type: 'move', dx: 0, dy: 1 }]);
    expect(moments).toHaveLength(1);
    expect(moments[0]).toMatchObject({ depth: 1, move: 2, damage: 1, by: 'the Goblin', did: 'stepping down' });
    expect(momentText(moments[0])).toBe(`Floor 1, move 2: The Goblin took a heart while you were stepping down. ${moments[0].better[0].toUpperCase()}${moments[0].better.slice(1)} instead would have avoided it.`);
  });

  it('says nothing when nothing could have been done better', () => {
    const start = setup(['...g...', '.......', '...@...', '.......']);
    expect(postMortemFrom(start, [{ type: 'wait' }])).toEqual([]);
  });

  it('marks the turning point in a run that died', () => {
    for (let seed = 1; seed < 60; seed++) {
      const { state, actions } = botRun(newRun(seed));
      if (state.outcome?.kind !== 'died') continue;
      const moments = postMortem(seed, actions);
      if (!moments.length) continue;
      expect(moments.filter((m) => m.turningPoint)).toHaveLength(1);
      expect(keyMoments(moments)[0]).toBeDefined();
      expect(keyMoments(moments).length).toBeLessThanOrEqual(3);
      return;
    }
    throw new Error('expected at least one bot death with an avoidable hit');
  });

  it('every suggested move really avoids damage', () => {
    const start = setup(['...g...', '.......', '...@...', '.......']);
    const after = step(start, { type: 'wait' }).state;
    const [m] = postMortemFrom(start, [{ type: 'wait' }, { type: 'move', dx: 0, dy: 1 }]);
    expect(m.better).not.toBe('stepping down');
    expect(after.floor.enemies[0].intent.type).toBe('attack');
  });
});
