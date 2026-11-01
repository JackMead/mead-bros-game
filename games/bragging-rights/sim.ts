import { config } from './config';
import { generateFloor } from './generate';
import { DIRS, add, alignedDir, dist, distances, inBounds, same, setTile, tileAt } from './grid';
import type { EnemyType, FloorKit } from './kit';
import { DEFAULT_KIT, enemyType, getKit } from './kits';
import type {
  Action, Enemy, Floor, GameEvent, Intent, OutcomeKind, PageKind, Pos, RunState, StepResult,
} from './types';

/**
 * The rules. Pure and deterministic: the same seed and the same actions always give the same
 * run, which is what lets a run be resumed (and, in v1, checked by a server) by replaying it.
 * No dice: randomness only shapes the dungeon, in generate.ts.
 */

export function newRun(seed: number, kitId: string = DEFAULT_KIT): RunState {
  const kit = getKit(kitId);
  const state: RunState = {
    seed, kitId, depth: 1,
    floor: generateFloor(seed, 1, kit),
    player: {
      pos: { x: 0, y: 0 },
      hearts: config.player.hearts,
      maxHearts: config.player.hearts,
      oil: config.player.oil,
      maxOil: config.player.oil,
      carried: 0,
      pages: new Array(config.player.pageSlots).fill(null),
      hasRing: false,
      corruption: 0,
      invisible: 0,
    },
    phase: 'play', turn: 0, nextId: 1000, outcome: null,
  };
  beginFloor(state, kit, []);
  return state;
}

/** Apply one action. Invalid actions return `ok: false` and leave the state untouched. */
export function step(state: RunState, action: Action): StepResult {
  const fail: StepResult = { ok: false, state, events: [] };
  if (state.phase === 'over') return fail;

  const s = cloneState(state);
  const kit = getKit(s.kitId);
  const events: GameEvent[] = [];

  if (s.phase === 'stairs') {
    if (action.type === 'bank') finish(s, 'banked', events);
    else if (action.type === 'descend' && canDescend(s)) descend(s, kit, events);
    else return fail;
    return { ok: true, state: s, events };
  }

  if (!playerAct(s, kit, action, events)) return fail;

  s.turn++;
  s.player.oil = Math.max(0, s.player.oil - config.player.oilPerTurn);

  if (same(s.player.pos, s.floor.stairs)) {
    reachStairs(s, events);
    return { ok: true, state: s, events };
  }
  if (s.player.oil <= 0) {
    finish(s, 'lampOut', events);
    return { ok: true, state: s, events };
  }

  enemyPhase(s, kit, events);
  if (s.player.hearts <= 0) {
    finish(s, 'died', events);
    return { ok: true, state: s, events };
  }
  s.player.invisible = Math.max(0, s.player.invisible - 1);
  return { ok: true, state: s, events };
}

/** Rebuild a run from its seed and action log. Stops at the first invalid action. */
export function replay(seed: number, actions: readonly Action[], kitId: string = DEFAULT_KIT): RunState {
  let state = newRun(seed, kitId);
  for (const action of actions) {
    const r = step(state, action);
    if (!r.ok) break;
    state = r.state;
  }
  return state;
}

/**
 * Copy everything a step can change. Positions, intents and items are never edited in place
 * (always replaced), so they are shared; the determinism tests guard this.
 */
function cloneState(s: RunState): RunState {
  return {
    ...s,
    floor: { ...s.floor, tiles: s.floor.tiles.slice(), items: s.floor.items.slice(), enemies: s.floor.enemies.map((e) => ({ ...e })) },
    player: { ...s.player, pages: s.player.pages.slice() },
  };
}

/** A copy of `state` on a hand-built floor, with the player on its start square. For tests and tools. */
export function withFloor(state: RunState, floor: Floor): RunState {
  const s = structuredClone(state);
  s.floor = structuredClone(floor);
  beginFloor(s, getKit(s.kitId), []);
  return s;
}

export function canDescend(s: RunState): boolean {
  return s.phase === 'stairs' && s.depth < config.run.floors && s.player.oil > 0;
}

export function enemyAt(s: RunState, p: Pos): Enemy | undefined {
  return s.floor.enemies.find((e) => same(e.pos, p));
}

export function typeOf(s: RunState, e: Enemy): EnemyType {
  return enemyType(getKit(s.kitId), e.type);
}

/** Squares a page in `slot` can be aimed at, for the UI to highlight. */
export function pageTargets(s: RunState, slot: number): Pos[] {
  const kind = s.player.pages[slot];
  if (!kind || s.phase !== 'play') return [];
  const out: Pos[] = [];
  for (let y = 0; y < s.floor.height; y++) {
    for (let x = 0; x < s.floor.width; x++) {
      if (validPageTarget(s, kind, { x, y })) out.push({ x, y });
    }
  }
  return out;
}

/** Every square some enemy will hit next turn. Useful for the UI and for bots. */
export function dangerSquares(s: RunState): Pos[] {
  const out: Pos[] = [];
  for (const e of s.floor.enemies) {
    if (e.intent.type === 'attack' || e.intent.type === 'charge') out.push(...e.intent.squares);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Player

function playerAct(s: RunState, kit: FloorKit, action: Action, events: GameEvent[]): boolean {
  const p = s.player;
  switch (action.type) {
    case 'move': {
      const { dx, dy } = action;
      if (!Number.isInteger(dx) || !Number.isInteger(dy)) return false;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) return false;
      const to = add(p.pos, { x: dx, y: dy });
      if (!inBounds(s.floor, to)) return false;
      const target = enemyAt(s, to);
      if (target) {
        events.push({ type: 'attack', by: 'player', at: to });
        hurtEnemy(s, target, config.player.attack, events);
        return true;
      }
      if (tileAt(s.floor, to) !== 'floor') return false;
      if (config.experiments.disengage) disengage(s, kit, to, events);
      events.push({ type: 'playerMove', from: p.pos, to });
      p.pos = to;
      collect(s, events);
      return true;
    }
    case 'wait':
      return true;
    case 'ring': {
      if (!p.hasRing || p.invisible > 0) return false;
      p.invisible = config.ring.invisibleTurns;
      p.corruption++;
      events.push({ type: 'ring' });
      spawnHunters(s, kit, 1, events);
      return true;
    }
    case 'page': {
      const kind = p.pages[action.slot];
      const at = { x: action.x, y: action.y };
      if (!kind || !validPageTarget(s, kind, at)) return false;
      p.pages[action.slot] = null;
      events.push({ type: 'page', kind, at });
      usePage(s, kind, at, events);
      return true;
    }
    default:
      return false;
  }
}

/** Experiment: enemies about to strike you get a free hit if you step out of their reach. */
function disengage(s: RunState, kit: FloorKit, to: Pos, events: GameEvent[]): void {
  for (const e of s.floor.enemies) {
    const t = enemyType(kit, e.type);
    if ((t.behaviour !== 'melee' && t.behaviour !== 'hunter') || e.intent.type !== 'attack') continue;
    if (dist(e.pos, s.player.pos) !== 1 || dist(e.pos, to) <= 1) continue;
    events.push({ type: 'attack', by: e.id, at: s.player.pos });
    hurtPlayer(s, e.intent.damage, events);
    e.intent = { type: 'move' };
  }
}

function validPageTarget(s: RunState, kind: PageKind, at: Pos): boolean {
  const f = s.floor;
  const me = s.player.pos;
  if (!inBounds(f, at) || same(at, me)) return false;
  const d = dist(me, at);
  const enemy = enemyAt(s, at);
  switch (kind) {
    case 'shove':
      return d === 1 && !!enemy;
    case 'swap':
      // Not with a hunter inside a wall or over a chasm: you couldn't stand there.
      return d <= config.pages.swapRange && !!enemy && tileAt(f, at) === 'floor';
    case 'ward':
      return d === 1 && !enemy && tileAt(f, at) === 'floor' && !same(at, f.stairs)
        && !f.items.some((i) => same(i.pos, at));
    case 'blink':
      return d <= config.pages.blinkRange && !enemy && tileAt(f, at) === 'floor';
  }
}

function usePage(s: RunState, kind: PageKind, at: Pos, events: GameEvent[]): void {
  const p = s.player;
  switch (kind) {
    case 'shove': {
      const enemy = enemyAt(s, at)!;
      const dir = { x: Math.sign(at.x - p.pos.x), y: Math.sign(at.y - p.pos.y) };
      enemy.intent = { type: 'stunned' };
      for (let i = 0; i < config.pages.shoveDistance; i++) {
        const next = add(enemy.pos, dir);
        const other = enemyAt(s, next);
        if (!inBounds(s.floor, next) || tileAt(s.floor, next) === 'wall' || same(next, s.floor.stairs)) {
          hurtEnemy(s, enemy, 1, events);
          break;
        }
        if (other) {
          hurtEnemy(s, other, 1, events);
          hurtEnemy(s, enemy, 1, events);
          break;
        }
        events.push({ type: 'enemyMove', id: enemy.id, from: enemy.pos, to: next });
        enemy.pos = next;
        if (tileAt(s.floor, next) === 'chasm' && !flies(s, enemy)) {
          fall(s, enemy, events);
          break;
        }
      }
      return;
    }
    case 'swap': {
      const enemy = enemyAt(s, at)!;
      events.push({ type: 'playerMove', from: p.pos, to: at });
      events.push({ type: 'enemyMove', id: enemy.id, from: at, to: p.pos });
      enemy.pos = p.pos;
      p.pos = at;
      collect(s, events);
      return;
    }
    case 'ward':
      setTile(s.floor, at, 'wall');
      return;
    case 'blink':
      events.push({ type: 'playerMove', from: p.pos, to: at });
      p.pos = at;
      collect(s, events);
      return;
  }
}

function collect(s: RunState, events: GameEvent[]): void {
  const p = s.player;
  const f = s.floor;
  const idx = f.items.findIndex((i) => same(i.pos, p.pos));
  if (idx < 0) return;
  const item = f.items[idx];
  switch (item.kind) {
    case 'relic':
      p.carried += item.value;
      break;
    case 'oil':
      p.oil = Math.min(p.maxOil, p.oil + item.value);
      break;
    case 'ring':
      p.hasRing = true;
      break;
    case 'page': {
      const slot = p.pages.indexOf(null);
      if (slot < 0) return; // Hands full: leave it on the floor.
      p.pages[slot] = item.page!;
      break;
    }
  }
  f.items.splice(idx, 1);
  events.push({ type: 'pickup', kind: item.kind, value: item.value, pos: item.pos });
}

// ---------------------------------------------------------------------------
// Floors and endings

function beginFloor(s: RunState, kit: FloorKit, events: GameEvent[]): void {
  s.player.pos = { ...s.floor.start };
  spawnHunters(s, kit, Math.min(s.player.corruption, config.ring.maxHuntersPerFloor), events);
  for (const e of s.floor.enemies) decide(s, kit, e);
}

function reachStairs(s: RunState, events: GameEvent[]): void {
  const p = s.player;
  const healed = Math.min(config.player.heartsPerFloor, p.maxHearts - p.hearts);
  p.hearts += healed;
  events.push({ type: 'stairs', healed });
  if (s.depth >= config.run.floors) finish(s, 'escaped', events);
  else s.phase = 'stairs';
}

function descend(s: RunState, kit: FloorKit, events: GameEvent[]): void {
  s.depth++;
  s.player.pages = s.player.pages.map(() => null); // Pages crumble when you leave their floor.
  s.player.invisible = 0;
  s.floor = generateFloor(s.seed, s.depth, kit);
  s.phase = 'play';
  beginFloor(s, kit, events);
  events.push({ type: 'descend', depth: s.depth });
}

function finish(s: RunState, kind: OutcomeKind, events: GameEvent[]): void {
  const carried = s.player.carried;
  const kept = kind === 'banked' || kind === 'escaped';
  const score = kept ? carried : Math.floor(carried * config.run.deathKeepShare);
  s.phase = 'over';
  s.outcome = { kind, carried, score };
  events.push({ type: 'over', outcome: s.outcome });
}

// ---------------------------------------------------------------------------
// Enemies

function spawnHunters(s: RunState, kit: FloorKit, count: number, events: GameEvent[]): void {
  const f = s.floor;
  for (let n = 0; n < count; n++) {
    let best: Pos | null = null;
    let bestDist = -1;
    for (let y = 0; y < f.height; y++) {
      for (let x = 0; x < f.width; x++) {
        const p = { x, y };
        if (tileAt(f, p) !== 'floor' || same(p, f.stairs) || same(p, s.player.pos) || enemyAt(s, p)) continue;
        const d = dist(p, s.player.pos);
        if (d > bestDist) { best = p; bestDist = d; }
      }
    }
    if (!best) return;
    const hunter: Enemy = { id: s.nextId++, type: kit.hunter.id, pos: best, hp: kit.hunter.hp, intent: { type: 'none' }, tick: 0 };
    f.enemies.push(hunter);
    events.push({ type: 'spawn', id: hunter.id, pos: best });
    decide(s, kit, hunter);
  }
}

function enemyPhase(s: RunState, kit: FloorKit, events: GameEvent[]): void {
  const order = [...s.floor.enemies].sort((a, b) => a.id - b.id);
  for (const e of order) {
    if (!s.floor.enemies.includes(e)) continue; // Killed earlier this phase.
    e.tick++;
    const charged = execute(s, kit, e, events);
    if (s.player.hearts <= 0) return;
    if (!s.floor.enemies.includes(e)) continue;
    if (charged) e.intent = { type: 'stunned' };
    else decide(s, kit, e);
  }
}

/** Carry out an enemy's telegraphed intent. Returns true if it charged (and so needs to recover). */
function execute(s: RunState, kit: FloorKit, e: Enemy, events: GameEvent[]): boolean {
  const intent = e.intent;
  switch (intent.type) {
    case 'none':
    case 'stunned':
      return false;
    case 'move':
      moveEnemy(s, kit, e, events);
      return false;
    case 'attack': {
      events.push({ type: 'attack', by: e.id, at: intent.squares[0] ?? e.pos });
      const t = enemyType(kit, e.type);
      // Arrows travel outwards and stop at walls (a ward can block a telegraphed shot).
      for (const sq of intent.squares) {
        if (t.behaviour === 'archer' && tileAt(s.floor, sq) === 'wall') break;
        hitSquare(s, e, sq, intent.damage, events);
      }
      return false;
    }
    case 'charge': {
      for (const sq of intent.squares) {
        if (!inBounds(s.floor, sq) || tileAt(s.floor, sq) === 'wall' || same(sq, s.floor.stairs)) break;
        if (same(sq, s.player.pos)) {
          events.push({ type: 'attack', by: e.id, at: sq });
          hurtPlayer(s, intent.damage, events);
          break;
        }
        const other = enemyAt(s, sq);
        if (other) {
          events.push({ type: 'attack', by: e.id, at: sq });
          hurtEnemy(s, other, intent.damage, events);
          break;
        }
        events.push({ type: 'enemyMove', id: e.id, from: e.pos, to: sq });
        e.pos = sq;
        if (tileAt(s.floor, sq) === 'chasm') {
          fall(s, e, events);
          break;
        }
      }
      return true;
    }
  }
}

function hitSquare(s: RunState, by: Enemy, sq: Pos, damage: number, events: GameEvent[]): void {
  if (same(sq, s.player.pos)) hurtPlayer(s, damage, events);
  const other = enemyAt(s, sq);
  if (other && other !== by) hurtEnemy(s, other, damage, events);
}

/** Choose and telegraph what an enemy will do next turn. */
function decide(s: RunState, kit: FloorKit, e: Enemy): void {
  const t = enemyType(kit, e.type);
  const me = s.player.pos;
  const seen = s.player.invisible === 0 || t.behaviour === 'hunter';
  if (!seen) {
    e.intent = { type: 'none' };
    return;
  }
  const d = dist(e.pos, me);
  let intent: Intent = { type: 'move' };
  switch (t.behaviour) {
    case 'melee':
      if (d === 1) intent = { type: 'attack', squares: meleeSquares(s, e.pos, me), damage: t.damage };
      break;
    case 'hunter':
      if (d === 1) intent = { type: 'attack', squares: [{ ...me }], damage: t.damage };
      break;
    case 'brute':
      if (d === 1) {
        const squares = DIRS.map((dir) => add(e.pos, dir))
          .filter((p) => inBounds(s.floor, p) && tileAt(s.floor, p) !== 'wall');
        intent = { type: 'attack', squares, damage: t.damage };
      }
      break;
    case 'archer': {
      const dir = alignedDir(e.pos, me);
      if (dir && d <= config.ranges.archer && clearLine(s, e.pos, me, false)) {
        intent = { type: 'attack', squares: ray(s, e.pos, dir, config.ranges.archer, false), damage: t.damage };
      }
      break;
    }
    case 'charger': {
      const dir = alignedDir(e.pos, me);
      if (dir && d <= config.ranges.charger && clearLine(s, e.pos, me, true)) {
        intent = { type: 'charge', squares: ray(s, e.pos, dir, config.ranges.charger, true), damage: t.damage };
      }
      break;
    }
  }
  e.intent = intent;
}

function meleeSquares(s: RunState, from: Pos, target: Pos): Pos[] {
  const open = (p: Pos) => inBounds(s.floor, p) && tileAt(s.floor, p) !== 'wall';
  switch (config.experiments.melee) {
    case 'square':
      return [{ ...target }];
    case 'lunge': {
      const beyond = add(target, { x: Math.sign(target.x - from.x), y: Math.sign(target.y - from.y) });
      return open(beyond) ? [{ ...target }, beyond] : [{ ...target }];
    }
    case 'reach':
      return DIRS.map((d) => add(from, d)).filter(open);
  }
}

/** True if nothing solid lies strictly between a and b. Chargers also refuse to charge over a chasm. */
function clearLine(s: RunState, a: Pos, b: Pos, avoidChasm: boolean): boolean {
  const dir = alignedDir(a, b)!;
  for (let p = add(a, dir); !same(p, b); p = add(p, dir)) {
    const tile = tileAt(s.floor, p);
    if (tile === 'wall' || (avoidChasm && tile === 'chasm') || same(p, s.floor.stairs)) return false;
  }
  return true;
}

/** Squares outward from `from` until a wall, the edge or `range`. A charge's ray ends on a chasm. */
function ray(s: RunState, from: Pos, dir: Pos, range: number, charge: boolean): Pos[] {
  const out: Pos[] = [];
  let p = add(from, dir);
  for (let i = 0; i < range && inBounds(s.floor, p); i++, p = add(p, dir)) {
    const tile = tileAt(s.floor, p);
    if (tile === 'wall' || (charge && same(p, s.floor.stairs))) break;
    out.push(p);
    if (charge && tile === 'chasm') break;
  }
  return out;
}

function moveEnemy(s: RunState, kit: FloorKit, e: Enemy, events: GameEvent[]): void {
  const t = enemyType(kit, e.type);
  const f = s.floor;
  const me = s.player.pos;
  const free = (p: Pos) => inBounds(f, p) && !same(p, f.stairs) && !same(p, me) && !enemyAt(s, p);

  if (t.behaviour === 'brute' && e.tick % 2 === 1) return; // Lumbers: every other turn.

  let next: Pos | null = null;
  if (t.behaviour === 'hunter') {
    // Straight at you, through walls and over chasms.
    let best = dist(e.pos, me);
    for (const dir of DIRS) {
      const p = add(e.pos, dir);
      if (free(p) && dist(p, me) < best) { best = dist(p, me); next = p; }
    }
  } else {
    const open = (p: Pos) => {
      const tile = tileAt(f, p);
      return tile === 'floor' || (t.behaviour === 'brute' && tile === 'wall');
    };
    const map = distances(f, me, open);
    const at = (p: Pos) => map[p.y * f.width + p.x];
    if (t.behaviour === 'archer') next = archerStep(s, e, free);
    if (!next) {
      let best = at(e.pos);
      for (const dir of DIRS) {
        const p = add(e.pos, dir);
        if (!free(p) || !open(p) || at(p) < 0) continue;
        if (best < 0 || at(p) < best) { best = at(p); next = p; }
      }
    }
  }
  if (!next) return;
  if (t.behaviour === 'brute' && tileAt(f, next) === 'wall') {
    setTile(f, next, 'floor');
    events.push({ type: 'smash', pos: next });
    return;
  }
  events.push({ type: 'enemyMove', id: e.id, from: e.pos, to: next });
  e.pos = next;
}

/** Archers prefer a step that lines up a shot from at least 2 squares away. */
function archerStep(s: RunState, e: Enemy, free: (p: Pos) => boolean): Pos | null {
  const me = s.player.pos;
  for (const dir of DIRS) {
    const p = add(e.pos, dir);
    if (!free(p) || tileAt(s.floor, p) !== 'floor') continue;
    const d = dist(p, me);
    if (d >= 2 && d <= config.ranges.archer && alignedDir(p, me) && clearLine(s, p, me, false)) return p;
  }
  return null;
}

function flies(s: RunState, e: Enemy): boolean {
  return typeOf(s, e).behaviour === 'hunter';
}

function hurtPlayer(s: RunState, amount: number, events: GameEvent[]): void {
  s.player.hearts = Math.max(0, s.player.hearts - amount);
  events.push({ type: 'playerHurt', amount });
}

function hurtEnemy(s: RunState, e: Enemy, amount: number, events: GameEvent[]): void {
  e.hp -= amount;
  events.push({ type: 'enemyHurt', id: e.id, amount });
  if (e.hp <= 0) {
    s.floor.enemies = s.floor.enemies.filter((x) => x !== e);
    events.push({ type: 'kill', id: e.id, type_: e.type, pos: e.pos });
  }
}

function fall(s: RunState, e: Enemy, events: GameEvent[]): void {
  s.floor.enemies = s.floor.enemies.filter((x) => x !== e);
  events.push({ type: 'fall', id: e.id, type_: e.type, pos: e.pos });
}
