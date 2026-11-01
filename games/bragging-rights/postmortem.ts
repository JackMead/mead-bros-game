import { enemyType, getKit } from './kits';
import { PAGES } from './pages';
import { newRun, step } from './sim';
import { PERSONAS, candidateActions, evaluate } from './solver';
import type { Action, GameEvent, RunState } from './types';

/**
 * After a run: the moments it went wrong. Replays every move, and for each hit you took
 * checks whether another move that turn would have taken no damage without walking into a
 * certain hit next turn. Teaches skill, which is the only thing that carries between runs.
 * Shown only after the run ends.
 */

export interface Moment {
  depth: number;
  /** Move number on that floor, from 1. */
  move: number;
  damage: number;
  by: string;
  /** The move made. */
  did: string;
  /** A move that would have avoided the damage. */
  better: string;
  /** The hit that ended the run, or the last avoidable one before it. */
  turningPoint: boolean;
}

const DIRECTION: Record<string, string> = {
  '0,-1': 'up', '1,-1': 'up-right', '1,0': 'right', '1,1': 'down-right',
  '0,1': 'down', '-1,1': 'down-left', '-1,0': 'left', '-1,-1': 'up-left',
};

export function describe(s: RunState, a: Action): string {
  const kit = getKit(s.kitId);
  switch (a.type) {
    case 'move': {
      const target = s.floor.enemies.find((e) => e.pos.x === s.player.pos.x + a.dx && e.pos.y === s.player.pos.y + a.dy);
      return target ? `attacking the ${enemyType(kit, target.type).name}` : `stepping ${DIRECTION[`${a.dx},${a.dy}`]}`;
    }
    case 'wait': return 'waiting';
    case 'ring': return 'putting on the ring';
    case 'page': return `using ${PAGES[s.player.pages[a.slot]!].name}`;
    case 'bank': return 'banking';
    case 'descend': return 'going deeper';
  }
}

const hurt = (events: GameEvent[]) => events.reduce((n, e) => n + (e.type === 'playerHurt' ? e.amount : 0), 0);

/** Who landed the hits in a step, e.g. "the Goblin", "2 Goblins", "the Goblin and the Cave troll". */
function attackersOf(s: RunState, events: GameEvent[]): string {
  const kit = getKit(s.kitId);
  const counts = new Map<string, number>();
  let current: string | null = null;
  for (const e of events) {
    if (e.type === 'attack' && e.by !== 'player') {
      const enemy = s.floor.enemies.find((x) => x.id === e.by);
      current = enemy ? enemyType(kit, enemy.type).name : kit.hunter.name;
    }
    if (e.type === 'playerHurt') {
      const name = current ?? 'something';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  const parts = [...counts].map(([name, n]) => (n === 1 ? `the ${name}` : `${n} ${name}s`));
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0] ?? 'something';
}

/** Is there any move from here that takes no damage this turn? */
function hasSafeMove(s: RunState): boolean {
  if (s.phase !== 'play') return true;
  return candidateActions(s).some((a) => {
    const r = step(s, a);
    return r.ok && hurt(r.events) === 0;
  });
}

export function postMortemFrom(start: RunState, actions: readonly Action[]): Moment[] {
  const moments: Moment[] = [];
  let state = start;
  let move = 0;
  let depth = state.depth;
  for (const action of actions) {
    if (state.depth !== depth) { depth = state.depth; move = 0; }
    if (state.phase === 'play') move++;
    const r = step(state, action);
    if (!r.ok) break;
    const damage = hurt(r.events);
    if (damage > 0 && state.phase === 'play') {
      let better: { action: Action; value: number } | null = null;
      for (const alt of candidateActions(state)) {
        const ar = step(state, alt);
        if (!ar.ok || hurt(ar.events) > 0 || !hasSafeMove(ar.state)) continue;
        const value = evaluate(ar.state, PERSONAS.balanced);
        if (!better || value > better.value) better = { action: alt, value };
      }
      if (better) {
        moments.push({
          depth, move, damage, by: attackersOf(state, r.events), did: describe(state, action),
          better: describe(state, better.action), turningPoint: false,
        });
      }
    }
    state = r.state;
  }
  if (state.outcome?.kind === 'died' && moments.length) moments[moments.length - 1].turningPoint = true;
  return moments;
}

export function postMortem(seed: number, actions: readonly Action[], kitId?: string): Moment[] {
  return postMortemFrom(newRun(seed, kitId), actions);
}

/** The few moments worth showing: the turning point first, then the costliest. */
export function keyMoments(moments: Moment[], max = 3): Moment[] {
  const turning = moments.filter((m) => m.turningPoint);
  const rest = moments.filter((m) => !m.turningPoint).sort((a, b) => b.damage - a.damage);
  return [...turning, ...rest].slice(0, max).sort((a, b) => a.depth - b.depth || a.move - b.move);
}

export function momentText(m: Moment): string {
  const hearts = m.damage === 1 ? 'a heart' : `${m.damage} hearts`;
  return `Floor ${m.depth}, move ${m.move}: ${capitalise(m.by)} took ${hearts} while you were ${m.did}. ${capitalise(m.better)} instead would have avoided it.`;
}

const capitalise = (s: string) => s[0].toUpperCase() + s.slice(1);
