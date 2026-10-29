import { config } from './config';
import { act, isValid, newGame, openChoices, visibleHotspots, type Action, type State } from './engine';
import type { Chapter } from './types';

export interface Analysis {
  solvable: boolean;
  /** Fewest actions to finish, counting switching brothers as free. */
  shortest: number | null;
  /** The shortest way through. SPOILERS: never print this in public. */
  solution: Action[];
  /** States you can reach but never finish from. Should always be empty. */
  deadEnds: number;
  states: number;
  /** Puzzles whose flag is never set on any route. */
  unreachablePuzzles: string[];
}

/**
 * Tries every action in every reachable state (breadth first), so it proves a chapter
 * can be finished and that nothing the player does can lock them out.
 * Which brother is active is part of each action rather than the state, since
 * switching is free.
 */
export function analyse(chapter: Chapter): Analysis {
  const start = newGame(chapter);
  const startKey = key(start);
  const seen = new Map<string, { state: State; from: string | null; via: Action[] }>();
  const edges = new Map<string, Set<string>>();
  seen.set(startKey, { state: start, from: null, via: [] });
  const queue = [startKey];
  const goals: string[] = [];
  const flagsSeen = new Set<string>();

  while (queue.length) {
    const k = queue.shift()!;
    const { state } = seen.get(k)!;
    state.flags.forEach((f) => flagsSeen.add(f));
    if (state.done) {
      goals.push(k);
      continue;
    }
    if (seen.size > config.maxSolverStates) throw new Error(`${chapter.id}: too many states to check`);
    const out = new Set<string>();
    edges.set(k, out);
    for (const { next, via } of successors(chapter, state)) {
      const nk = key(next);
      out.add(nk);
      if (!seen.has(nk)) {
        seen.set(nk, { state: next, from: k, via });
        queue.push(nk);
      }
    }
  }

  // Walk backwards from the goal to find every state that can still finish.
  const reverse = new Map<string, string[]>();
  for (const [from, tos] of edges) for (const to of tos) reverse.set(to, [...(reverse.get(to) ?? []), from]);
  const canFinish = new Set(goals);
  const back = [...goals];
  while (back.length) {
    for (const prev of reverse.get(back.pop()!) ?? []) {
      if (!canFinish.has(prev)) {
        canFinish.add(prev);
        back.push(prev);
      }
    }
  }

  const solution: Action[] = [];
  if (goals.length) {
    for (let k: string | null = goals[0]; k; k = seen.get(k)!.from) solution.unshift(...seen.get(k)!.via);
  }
  return {
    solvable: goals.length > 0,
    shortest: goals.length ? solution.filter((a) => a.type !== 'switch').length : null,
    solution,
    deadEnds: [...seen.keys()].filter((k) => !canFinish.has(k)).length,
    states: seen.size,
    unreachablePuzzles: chapter.puzzles.filter((p) => !flagsSeen.has(p.solved)).map((p) => p.id),
  };
}

/** Every state one action away, by any brother. Choices are followed straight away. */
function successors(chapter: Chapter, state: State): { next: State; via: Action[] }[] {
  const results: { next: State; via: Action[] }[] = [];
  for (const brother of chapter.brothers) {
    const as: State = { ...state, active: brother };
    const sw: Action = { type: 'switch', brother };
    const targets = [
      ...visibleHotspots(chapter, as).map((h) => h.id),
      ...chapter.brothers,
      ...as.inventory[brother],
    ];
    const actions: Action[] = [];
    for (const t of targets) {
      actions.push({ type: 'look', target: t }, { type: 'use', target: t });
      for (const item of as.inventory[brother]) actions.push({ type: 'item', item, target: t });
    }
    for (const a of actions) {
      if (!isValid(chapter, as, a)) continue;
      const { state: next } = act(chapter, as, a);
      if (next.choosing !== null) {
        openChoices(chapter, next).forEach((_, index) => {
          const c: Action = { type: 'choose', index };
          results.push({ next: act(chapter, next, c).state, via: [sw, a, c] });
        });
      } else {
        results.push({ next, via: [sw, a] });
      }
    }
  }
  return results;
}

/** Identity of a state for the search: what's been done and who holds what. */
function key(s: State): string {
  const inv = Object.entries(s.inventory)
    .map(([b, items]) => `${b}=${[...items].sort().join(',')}`)
    .join(';');
  return `${s.scene}|${[...s.flags].sort().join(',')}|${inv}|${s.done}`;
}
