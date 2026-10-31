import { config } from './config';
import { DIRS, add, dist, distances, inBounds, same, tileAt } from './grid';
import { canDescend, dangerSquares, enemyAt, step } from './sim';
import type { Action, RunState } from './types';

/**
 * A simple greedy player for tests and tuning. Not clever: it dodges telegraphs, fights
 * what's next to it, grabs nearby relics and heads for the stairs. A skilled human
 * should beat it comfortably.
 */
export function botAction(s: RunState): Action {
  if (s.phase === 'stairs') {
    const safe = s.player.hearts >= 2 && s.player.oil > 25;
    return canDescend(s) && safe ? { type: 'descend' } : { type: 'bank' };
  }
  const f = s.floor;
  const danger = dangerSquares(s);
  const dangerWithout = (id: number) => s.floor.enemies
    .filter((e) => e.id !== id)
    .flatMap((e) => (e.intent.type === 'attack' || e.intent.type === 'charge' ? e.intent.squares : []));
  const toStairs = distances(f, f.stairs, (p) => tileAt(f, p) === 'floor');

  let best: Action = { type: 'wait' };
  let bestScore = scoreSquare(s.player.pos, false, danger);
  for (const dir of DIRS) {
    const to = add(s.player.pos, dir);
    const action: Action = { type: 'move', dx: dir.x, dy: dir.y };
    if (!inBounds(f, to) || (!enemyAt(s, to) && tileAt(f, to) !== 'floor')) continue;
    const target = enemyAt(s, to);
    // Hitting first kills a 1-hp enemy before its telegraphed attack lands.
    const threats = target && target.hp <= config.player.attack ? dangerWithout(target.id) : danger;
    const score = scoreSquare(target ? s.player.pos : to, !!target, threats);
    if (score > bestScore) { bestScore = score; best = action; }
  }
  return best;

  function scoreSquare(p: { x: number; y: number }, attacking: boolean, threats: { x: number; y: number }[]): number {
    let score = 0;
    if (threats.some((d) => same(d, p))) score -= s.player.hearts > 2 ? 12 : 100;
    if (attacking) score += 15;
    const d = toStairs[p.y * f.width + p.x];
    score -= d < 0 ? 50 : d;
    const relic = f.items.find((i) => i.kind !== 'ring' && dist(i.pos, p) === 0);
    if (relic) score += 4;
    return score;
  }
}

/** Play a whole run with the bot. Returns the final state and the actions it took. */
export function botRun(start: RunState, maxSteps = 2000): { state: RunState; actions: Action[] } {
  let state = start;
  const actions: Action[] = [];
  for (let i = 0; i < maxSteps && state.phase !== 'over'; i++) {
    const action = botAction(state);
    const r = step(state, action);
    if (!r.ok) throw new Error(`Bot chose an invalid action: ${JSON.stringify(action)}`);
    state = r.state;
    actions.push(action);
  }
  return { state, actions };
}

export const MAX_TURNS = config.player.oil * 4;
