import { describe, expect, it } from 'vitest';
import { newRun, replay, step, withFloor } from './sim';
import { PERSONAS, findPar, planAction, playRun, solveFloor } from './solver';
import type { Floor, RunState, Tile } from './types';

function open(rows: string[]): RunState {
  const tiles: Tile[] = [];
  let start = { x: 0, y: 0 };
  let stairs = { x: 0, y: 0 };
  const enemies: Floor['enemies'] = [];
  const items: Floor['items'] = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    tiles.push(ch === '#' ? 'wall' : 'floor');
    if (ch === '@') start = { x, y };
    if (ch === '>') stairs = { x, y };
    if (ch === '$') items.push({ kind: 'relic', value: 5, pos: { x, y } });
    if (ch === 'g') enemies.push({ id: enemies.length + 1, type: 'goblin', pos: { x, y }, hp: 1, intent: { type: 'none' }, tick: 0 });
  }));
  return withFloor(newRun(1), { depth: 1, width: rows[0].length, height: rows.length, tiles, start, stairs, items, enemies });
}

describe('solver', () => {
  it('finds the stairs and picks up relics on the way', () => {
    const s = open(['>...$', '.....', '..#..', '....@']);
    const r = solveFloor(s, PERSONAS.balanced, { beam: 10 });
    expect(r.state.phase).toBe('stairs');
    expect(r.state.player.carried).toBe(5);
  });

  it('a one-turn planner steps out of a telegraphed square', () => {
    let s = open(['>......', '...g...', '.......', '...@...']);
    s = step(s, { type: 'wait' }).state; // goblin closes in and telegraphs
    expect(s.floor.enemies[0].intent.type).toBe('attack');
    const action = planAction(s, PERSONAS.careful, { horizon: 1, beam: 8 });
    const after = step(s, action).state;
    expect(after.player.hearts).toBe(s.player.hearts);
  });

  it('plays whole runs deterministically, and the lines replay exactly', () => {
    const a = playRun(42, PERSONAS.balanced, { horizon: 1, beam: 6 });
    const b = playRun(42, PERSONAS.balanced, { horizon: 1, beam: 6 });
    expect(a.actions).toEqual(b.actions);
    expect(a.state.phase).toBe('over');
    expect(replay(42, a.actions)).toEqual(a.state);
  });

  it('par is a real line that banks the par score', () => {
    const par = findPar(7, { beam: 6, maxTurns: 40 });
    const end = replay(7, par.actions);
    expect(end.phase).toBe('over');
    expect(end.outcome!.score).toBe(par.score);
    expect(par.score).toBeGreaterThan(0);
  }, 60_000);
});
