import { config } from './config';
import { DIRS, add, distances, inBounds, tileAt } from './grid';
import { canDescend, dangerSquares, enemyAt, newRun, pageTargets, step } from './sim';
import type { Action, RunState } from './types';

/**
 * A searching player. There are no dice, so a floor is a fully known puzzle: this explores
 * many lines of play at once (beam search) and keeps the most promising. Used to playtest
 * by machine and to find a "par" haul for each dungeon.
 *
 * It finds strong lines, not provably perfect ones: par means "best found".
 */

/** How a playing style values things. Higher relic weight = greedier, higher heart weight = more careful. */
export interface Persona {
  name: string;
  relic: number;
  heart: number;
  oil: number;
  /** Penalty per step from the stairs. */
  dist: number;
  /** Penalty for ending a turn on a telegraphed square. */
  danger: number;
  page: number;
  ring: number;
  corruption: number;
  /** Penalty per enemy heart still standing: people know a dead enemy is a safer floor. */
  enemy: number;
  /** At the stairs: true to go deeper. */
  descend(s: RunState): boolean;
}

export const PERSONAS: Record<string, Persona> = {
  careful: {
    name: 'careful', relic: 10, heart: 70, oil: 0.8, dist: 3, danger: 45, page: 4, ring: 2, corruption: 30, enemy: 10,
    descend: (s) => s.player.hearts >= 3 && s.player.oil >= 40,
  },
  balanced: {
    name: 'balanced', relic: 16, heart: 45, oil: 0.6, dist: 3, danger: 35, page: 4, ring: 4, corruption: 15, enemy: 8,
    descend: (s) => s.player.hearts >= 2 && s.player.oil >= 25,
  },
  greedy: {
    name: 'greedy', relic: 28, heart: 25, oil: 0.4, dist: 2, danger: 25, page: 3, ring: 6, corruption: 5, enemy: 6,
    descend: (s) => s.player.hearts >= 2 || s.player.oil >= 60,
  },
};

export interface SolveOptions {
  /** States kept per turn. Wider is stronger and slower. */
  beam: number;
  /** Give up on a floor after this many turns. */
  maxTurns: number;
}

const DEFAULTS: SolveOptions = { beam: 40, maxTurns: 60 };

interface Node {
  state: RunState;
  parent: Node | null;
  action: Action | null;
  value: number;
}

const stairsDistCache = new Map<string, number[]>();

function stairsDistance(s: RunState): number {
  const f = s.floor;
  const key = `${s.seed}:${f.depth}:${f.tiles.join('')}`;
  let map = stairsDistCache.get(key);
  if (!map) {
    if (stairsDistCache.size > 5000) stairsDistCache.clear();
    map = distances(f, f.stairs, (p) => tileAt(f, p) === 'floor');
    stairsDistCache.set(key, map);
  }
  const d = map[s.player.pos.y * f.width + s.player.pos.x];
  return d < 0 ? 40 : d;
}

/** How good a position is for this persona. Death is as bad as it gets. */
export function evaluate(s: RunState, p: Persona): number {
  if (s.phase === 'over') {
    const o = s.outcome!;
    if (o.kind === 'died' || o.kind === 'lampOut') return -1e9 + o.score;
    return 1e6 + o.carried * p.relic * 10; // escaped
  }
  const pl = s.player;
  let v = pl.carried * p.relic + pl.hearts * p.heart + pl.oil * p.oil
    + (pl.hasRing ? p.ring : 0) - pl.corruption * p.corruption;
  // Pages crumble when you leave the floor, so they're only worth something while you're on it.
  if (s.phase === 'stairs') return v + 1e5;
  v += pl.pages.filter(Boolean).length * p.page;
  v -= s.floor.enemies.reduce((n, e) => n + e.hp, 0) * p.enemy;
  v -= stairsDistance(s) * p.dist;
  if (dangerSquares(s).some((d) => d.x === pl.pos.x && d.y === pl.pos.y)) v -= p.danger;
  return v;
}

function key(s: RunState): string {
  const pl = s.player;
  const enemies = s.floor.enemies.map((e) => `${e.id}:${e.pos.x},${e.pos.y}:${e.hp}:${e.intent.type}:${e.tick % 2}`).join(';');
  return `${s.phase}|${pl.pos.x},${pl.pos.y}|${pl.hearts}|${pl.carried}|${pl.pages.join(',')}|${pl.hasRing}|${pl.corruption}|${pl.invisible}|${enemies}|${s.floor.items.length}|${s.floor.tiles.join('')}`;
}

/** Every action worth trying in play. */
export function candidateActions(s: RunState): Action[] {
  const out: Action[] = [{ type: 'wait' }];
  for (const d of DIRS) {
    const to = add(s.player.pos, d);
    if (inBounds(s.floor, to) && (enemyAt(s, to) || tileAt(s.floor, to) === 'floor')) out.push({ type: 'move', dx: d.x, dy: d.y });
  }
  if (s.player.hasRing && s.player.invisible === 0) out.push({ type: 'ring' });
  s.player.pages.forEach((page, slot) => {
    if (!page) return;
    for (const t of pageTargets(s, slot)) out.push({ type: 'page', slot, x: t.x, y: t.y });
  });
  return out;
}

function path(n: Node): Action[] {
  const out: Action[] = [];
  for (let x: Node | null = n; x && x.action; x = x.parent) out.push(x.action);
  return out.reverse();
}

/**
 * Search one floor from `start` (in play) until the stairs. Returns the actions of the best
 * line found and where it ends: on the stairs, at the end of the run, or (if nothing reached
 * the stairs in time) at the most promising position.
 */
export function solveFloor(start: RunState, persona: Persona, options: Partial<SolveOptions> = {}): { actions: Action[]; state: RunState } {
  const { beam, maxTurns } = { ...DEFAULTS, ...options };
  let frontier: Node[] = [{ state: start, parent: null, action: null, value: evaluate(start, persona) }];
  let best: Node | null = null;
  let firstFinish = -1;

  for (let turn = 0; turn < maxTurns && frontier.length > 0; turn++) {
    const next = new Map<string, Node>();
    for (const node of frontier) {
      for (const action of candidateActions(node.state)) {
        const r = step(node.state, action);
        if (!r.ok) continue;
        const child: Node = { state: r.state, parent: node, action, value: evaluate(r.state, persona) };
        if (r.state.phase !== 'play') {
          if (!best || child.value > best.value) best = child;
          if (firstFinish < 0 && child.value > -1e8) firstFinish = turn;
          continue;
        }
        const k = key(r.state);
        const seen = next.get(k);
        if (!seen || child.value > seen.value) next.set(k, child);
      }
    }
    frontier = [...next.values()].sort((a, b) => b.value - a.value).slice(0, beam);
    // Once the stairs are reachable, look a little further for richer lines, then stop.
    if (firstFinish >= 0 && turn - firstFinish >= 12) break;
  }

  const fallback = frontier[0];
  const chosen = best && best.value > -1e8 ? best : (fallback ?? best);
  if (!chosen) return { actions: [], state: start };
  return { actions: path(chosen), state: chosen.state };
}

export interface StairsStop {
  depth: number;
  /** Index into `actions` just after reaching these stairs. */
  at: number;
  carried: number;
  hearts: number;
  oil: number;
}

export interface SolvedRun {
  persona: string;
  actions: Action[];
  state: RunState;
  stops: StairsStop[];
}

/** Play a whole run as a persona. */
export function solveRun(seed: number, persona: Persona, options: Partial<SolveOptions> = {}, kitId?: string): SolvedRun {
  let state = newRun(seed, kitId);
  const actions: Action[] = [];
  const stops: StairsStop[] = [];
  let guard = 0;
  while (state.phase !== 'over' && guard++ < 200) {
    if (state.phase === 'stairs') {
      stops.push({ depth: state.depth, at: actions.length, carried: state.player.carried, hearts: state.player.hearts, oil: state.player.oil });
      const action: Action = canDescend(state) && persona.descend(state) ? { type: 'descend' } : { type: 'bank' };
      state = step(state, action).state;
      actions.push(action);
      continue;
    }
    const r = solveFloor(state, persona, options);
    if (r.actions.length === 0) {
      // Stuck: wait it out (the lamp ends the run eventually).
      state = step(state, { type: 'wait' }).state;
      actions.push({ type: 'wait' });
      continue;
    }
    state = r.state;
    actions.push(...r.actions);
  }
  if (state.outcome?.kind === 'escaped') {
    stops.push({ depth: state.depth, at: actions.length, carried: state.player.carried, hearts: state.player.hearts, oil: state.player.oil });
  }
  return { persona: persona.name, actions, state, stops };
}

export interface Par {
  /** Best haul found for this dungeon. */
  score: number;
  /** A line of play that banks it. */
  actions: Action[];
  persona: string;
  /** Floor it banks on. */
  depth: number;
}

/**
 * The best haul found on a dungeon. Each persona plays it going as deep as it can; banking at
 * any staircase it reached is a valid line, so par is the richest of those.
 */
export function findPar(seed: number, options: Partial<SolveOptions> = {}, kitId?: string): Par {
  let best: Par = { score: 0, actions: [], persona: 'none', depth: 0 };
  for (const base of Object.values(PERSONAS)) {
    const persona: Persona = { ...base, descend: (s) => canDescend(s) };
    const run = solveRun(seed, persona, options, kitId);
    for (const stop of run.stops) {
      if (stop.carried <= best.score) continue;
      const escaped = stop.depth >= config.run.floors;
      const actions = run.actions.slice(0, stop.at);
      if (!escaped) actions.push({ type: 'bank' });
      best = { score: stop.carried, actions, persona: base.name, depth: stop.depth };
    }
  }
  return best;
}

export interface PlayOptions {
  /** Turns a player thinks ahead. Humans see one turn of telegraphs; 2 or 3 is a strong human. */
  horizon: number;
  beam: number;
}

/**
 * Pick one move by thinking only `horizon` turns ahead, like a person reading the telegraphs,
 * then re-plan next turn. Far weaker than solveFloor, which is the point.
 */
export function planAction(
  s: RunState, persona: Persona, { horizon, beam }: PlayOptions, visits?: Map<string, number>,
): Action {
  interface Leaf { state: RunState; first: Action; value: number; bias: number }
  let frontier: Leaf[] = [];
  let best: Leaf | null = null;
  for (const action of candidateActions(s)) {
    const r = step(s, action);
    if (!r.ok) continue;
    // Going round in circles feels bad: squares visited often on this floor lose appeal.
    const bias = (visits?.get(`${r.state.player.pos.x},${r.state.player.pos.y}`) ?? 0) * LOOP_PENALTY;
    const leaf = { state: r.state, first: action, bias, value: evaluate(r.state, persona) - bias };
    if (r.state.phase !== 'play') { if (!best || leaf.value > best.value) best = leaf; continue; }
    frontier.push(leaf);
  }
  for (let depth = 1; depth < horizon && frontier.length; depth++) {
    const next = new Map<string, Leaf>();
    for (const leaf of frontier.sort((a, b) => b.value - a.value).slice(0, beam)) {
      for (const action of candidateActions(leaf.state)) {
        const r = step(leaf.state, action);
        if (!r.ok) continue;
        const child = { state: r.state, first: leaf.first, bias: leaf.bias, value: evaluate(r.state, persona) - leaf.bias };
        if (r.state.phase !== 'play') { if (!best || child.value > best.value) best = child; continue; }
        const k = key(r.state);
        const seen = next.get(k);
        if (!seen || child.value > seen.value) next.set(k, child);
      }
    }
    // A line that dies within the horizon is avoided, but the turn still has to be played.
    if (next.size === 0) break;
    frontier = [...next.values()];
  }
  for (const leaf of frontier) if (!best || leaf.value > best.value) best = leaf;
  return best?.first ?? { type: 'wait' };
}

const LOOP_PENALTY = 6;

/** Play a whole run one planned move at a time. */
export function playRun(seed: number, persona: Persona, options: PlayOptions, kitId?: string): SolvedRun {
  let state = newRun(seed, kitId);
  const actions: Action[] = [];
  const stops: StairsStop[] = [];
  let visits = new Map<string, number>();
  for (let i = 0; i < 3000 && state.phase !== 'over'; i++) {
    let action: Action;
    if (state.phase === 'stairs') {
      stops.push({ depth: state.depth, at: actions.length, carried: state.player.carried, hearts: state.player.hearts, oil: state.player.oil });
      action = canDescend(state) && persona.descend(state) ? { type: 'descend' } : { type: 'bank' };
      visits = new Map();
    } else {
      action = planAction(state, persona, options, visits);
      const here = `${state.player.pos.x},${state.player.pos.y}`;
      visits.set(here, (visits.get(here) ?? 0) + 1);
    }
    const r = step(state, action);
    state = r.ok ? r.state : step(state, { type: 'wait' }).state;
    actions.push(r.ok ? action : { type: 'wait' });
  }
  return { persona: persona.name, actions, state, stops };
}
