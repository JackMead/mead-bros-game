import { describe, expect, it } from 'vitest';
import { botRun } from './bot';
import { config } from './config';
import { tileAt } from './grid';
import { canDescend, moveCosts, newRun, pageTargets, replay, step, withFloor } from './sim';
import type { Action, Enemy, Floor, Item, RunState, Tile } from './types';

const ENEMIES: Record<string, string> = { g: 'goblin', a: 'archer', w: 'wolf', t: 'troll', h: 'wraith' };

/**
 * Build a run on a hand-drawn floor.
 * `.` floor, `#` wall, `~` chasm, `@` player, `>` stairs, `$` relic (5), `o` oil (10), `r` ring,
 * g/a/w/t/h goblin, archer, wolf, troll, wraith.
 */
function setup(rows: string[], tweak: (s: RunState) => void = () => {}): RunState {
  const tiles: Tile[] = [];
  const items: Item[] = [];
  const enemies: Enemy[] = [];
  let start = { x: 0, y: 0 };
  let stairs = { x: -9, y: -9 };
  let id = 1;
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    tiles.push(ch === '#' ? 'wall' : ch === '~' ? 'chasm' : 'floor');
    const pos = { x, y };
    if (ch === '@') start = pos;
    if (ch === '>') stairs = pos;
    if (ch === '$') items.push({ kind: 'relic', value: 5, pos });
    if (ch === 'o') items.push({ kind: 'oil', value: 10, pos });
    if (ch === 'r') items.push({ kind: 'ring', value: 0, pos });
    if (ENEMIES[ch]) {
      const hp = { goblin: 1, archer: 1, wolf: 2, troll: 3, wraith: 2 }[ENEMIES[ch]]!;
      enemies.push({ id: id++, type: ENEMIES[ch], pos, hp, intent: { type: 'none' }, tick: 0 });
    }
  }));
  const floor: Floor = { depth: 1, width: rows[0].length, height: rows.length, tiles, start, stairs, items, enemies };
  const base = newRun(1);
  tweak(base);
  return withFloor(base, floor);
}

function act(s: RunState, ...actions: Action[]): RunState {
  for (const a of actions) {
    const r = step(s, a);
    expect(r.ok, `action ${JSON.stringify(a)} should be valid`).toBe(true);
    s = r.state;
  }
  return s;
}

const wait: Action = { type: 'wait' };
const move = (dx: number, dy: number): Action => ({ type: 'move', dx, dy });

describe('player actions', () => {
  it('moves 8 ways onto open floor but not into walls, chasms or off the map', () => {
    const s = setup(['.#.', '.@~', '...']);
    expect(act(s, move(1, 1)).player.pos).toEqual({ x: 2, y: 2 });
    expect(step(s, move(0, -1)).ok).toBe(false);
    expect(step(s, move(1, 0)).ok).toBe(false);
    expect(step(s, move(2, 0)).ok).toBe(false);
    expect(step(setup(['@.']), move(-1, 0)).ok).toBe(false);
  });

  it('leaves the state untouched on an invalid action', () => {
    const s = setup(['@#']);
    const r = step(s, move(1, 0));
    expect(r.ok).toBe(false);
    expect(r.state).toBe(s);
  });

  it('burns oil every turn and counts turns', () => {
    const s = act(setup(['@..']), wait, move(1, 0));
    expect(s.player.oil).toBe(config.player.oil - 2 * config.player.oilPerTurn);
    expect(s.turn).toBe(2);
  });

  it('picks up relics and oil', () => {
    let s = setup(['@$o'], (b) => { b.player.oil = 50; });
    s = act(s, move(1, 0), move(1, 0));
    expect(s.player.carried).toBe(5);
    expect(s.player.oil).toBe(50 - 2 + 10);
    expect(s.floor.items).toHaveLength(0);
  });

  it('attacks an enemy by moving into it', () => {
    const s = act(setup(['@g.']), move(1, 0));
    expect(s.floor.enemies).toHaveLength(0);
    expect(s.player.pos).toEqual({ x: 0, y: 0 });
  });
});

describe('enemies telegraph and you can dodge', () => {
  const rows = ['.......', '...g...', '.......', '...@...'];

  it('a goblin telegraphs the square you are on, then hits it', () => {
    let s = act(setup(rows), wait); // goblin steps next to you and telegraphs
    expect(s.floor.enemies[0].intent).toEqual({ type: 'attack', squares: [{ x: 3, y: 3 }], damage: 1 });
    s = act(s, wait);
    expect(s.player.hearts).toBe(config.player.hearts - 1);
  });

  it('sidestepping within its reach avoids the hit', () => {
    let s = act(setup(['...g...', '.......', '...@...']), wait);
    const g = s.floor.enemies[0].pos;
    const me = s.player.pos;
    // A neighbouring square that is still next to the goblin.
    const side = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => ({ dx, dy })))
      .find(({ dx, dy }) => (dx || dy) && Math.max(Math.abs(me.x + dx - g.x), Math.abs(me.y + dy - g.y)) === 1
        && !(me.x + dx === g.x && me.y + dy === g.y))!;
    s = act(s, move(side.dx, side.dy));
    expect(s.player.hearts).toBe(config.player.hearts);
  });

  it('walking out of reach of an enemy winding up gives it a free hit', () => {
    let s = act(setup(['...g...', '.......', '...@...', '.......']), wait);
    s = act(s, move(0, 1)); // (3,3): out of reach
    expect(s.player.hearts).toBe(config.player.hearts - 1);
  });

  it('killing it first costs nothing', () => {
    let s = act(setup(['...g...', '.......', '...@...']), wait);
    const g = s.floor.enemies[0].pos;
    s = act(s, move(g.x - s.player.pos.x, g.y - s.player.pos.y));
    expect(s.floor.enemies).toHaveLength(0);
    expect(s.player.hearts).toBe(config.player.hearts);
  });

  it('no free hit from an enemy that is only moving', () => {
    let s = setup(['...g...', '.......', '.......', '...@...', '.......']);
    expect(s.floor.enemies[0].intent.type).toBe('move');
    s = act(s, move(0, 1));
    expect(s.player.hearts).toBe(config.player.hearts);
  });

  it('an archer shoots along a line, and a ward blocks it', () => {
    const s = setup(['a...@..'], (b) => { b.player.pages[0] = 'ward'; });
    expect(s.floor.enemies[0].intent.type).toBe('attack');
    expect(act(s, wait).player.hearts).toBe(config.player.hearts - 1);
    const warded = act(s, { type: 'page', slot: 0, x: 3, y: 0 });
    expect(tileAt(warded.floor, { x: 3, y: 0 })).toBe('wall');
    expect(warded.player.hearts).toBe(config.player.hearts);
  });

  it('a charging wolf that misses runs on into a chasm', () => {
    const s = setup(['......', 'w..@.~']);
    expect(s.floor.enemies[0].intent.type).toBe('charge');
    const dodged = act(s, move(0, -1));
    expect(dodged.player.hearts).toBe(config.player.hearts);
    expect(dodged.floor.enemies).toHaveLength(0);
  });

  it('a charging wolf that connects stops and needs a turn to recover', () => {
    const s = act(setup(['w..@..']), wait);
    expect(s.player.hearts).toBe(config.player.hearts - 1);
    expect(s.floor.enemies[0].pos).toEqual({ x: 2, y: 0 });
    expect(s.floor.enemies[0].intent.type).toBe('stunned');
  });

  it('a troll moves every other turn and smashes walls in its way', () => {
    let s = act(setup(['t#..@']), wait);
    expect(tileAt(s.floor, { x: 1, y: 0 })).toBe('wall');
    s = act(s, wait);
    expect(tileAt(s.floor, { x: 1, y: 0 })).toBe('floor');
    expect(s.floor.enemies[0].pos).toEqual({ x: 0, y: 0 });
  });

  it('a troll hits every square around it', () => {
    const s = setup(['...', '.t.', '..@']);
    const intent = s.floor.enemies[0].intent;
    expect(intent.type === 'attack' && intent.squares).toHaveLength(8);
    expect(act(s, move(-1, 0)).player.hearts).toBe(config.player.hearts - 2);
  });
});

describe('pages', () => {
  it('shove pushes two squares, and a wall hurts', () => {
    const s = act(setup(['@w.#'], (b) => { b.player.pages[0] = 'shove'; }), { type: 'page', slot: 0, x: 1, y: 0 });
    expect(s.floor.enemies[0].pos).toEqual({ x: 2, y: 0 });
    expect(s.floor.enemies[0].hp).toBe(1);
    expect(s.player.pages[0]).toBeNull();
  });

  it('shove into a chasm', () => {
    const s = act(setup(['@g~.'], (b) => { b.player.pages[0] = 'shove'; }), { type: 'page', slot: 0, x: 1, y: 0 });
    expect(s.floor.enemies).toHaveLength(0);
  });

  it('blink jumps up to 3 squares', () => {
    const s = setup(['@....'], (b) => { b.player.pages[1] = 'blink'; });
    expect(step(s, { type: 'page', slot: 1, x: 4, y: 0 }).ok).toBe(false);
    expect(act(s, { type: 'page', slot: 1, x: 3, y: 0 }).player.pos).toEqual({ x: 3, y: 0 });
    expect(pageTargets(s, 1)).toHaveLength(3);
  });

  it('swap trades places with an enemy', () => {
    const s = act(setup(['@..g'], (b) => { b.player.pages[0] = 'swap'; }), { type: 'page', slot: 0, x: 3, y: 0 });
    expect(s.player.pos).toEqual({ x: 3, y: 0 });
    expect(s.floor.enemies[0].pos.x).toBeLessThan(3);
  });

  it('cannot use an empty slot', () => {
    expect(step(setup(['@g']), { type: 'page', slot: 0, x: 1, y: 0 }).ok).toBe(false);
  });
});

describe('the ring', () => {
  it('makes you unseen but summons a hunter that sees you anyway', () => {
    let s = setup(['@r.....', '.......', '...g...']);
    expect(step(s, { type: 'ring' }).ok).toBe(false);
    s = act(s, move(1, 0), { type: 'ring' });
    expect(s.player.corruption).toBe(1);
    const goblin = s.floor.enemies.find((e) => e.type === 'goblin')!;
    const wraith = s.floor.enemies.find((e) => e.type === 'wraith')!;
    expect(goblin.intent.type).toBe('none');
    expect(wraith).toBeDefined();
    expect(wraith.intent.type).not.toBe('none');
    expect(step(s, { type: 'ring' }).ok).toBe(false); // already unseen
  });

  it('wears off after a few turns', () => {
    let s = act(setup(['@r.....', '.......', '......g']), move(1, 0), { type: 'ring' });
    for (let i = 1; i < config.ring.invisibleTurns; i++) s = act(s, wait);
    expect(s.player.invisible).toBe(0);
  });
});

describe('stairs, banking and endings', () => {
  it('reaching the stairs heals one heart and offers bank or descend', () => {
    let s = setup(['>@'], (b) => { b.player.hearts = 2; b.player.carried = 10; });
    s = act(s, move(-1, 0));
    expect(s.phase).toBe('stairs');
    expect(s.player.hearts).toBe(3);
    expect(step(s, wait).ok).toBe(false);
    const banked = act(s, { type: 'bank' });
    expect(banked.outcome).toEqual({ kind: 'banked', carried: 10, score: 10 });
    expect(step(banked, wait).ok).toBe(false);
  });

  it('never heals above max hearts', () => {
    expect(act(setup(['>@']), move(-1, 0)).player.hearts).toBe(config.player.hearts);
  });

  it('descending builds the next floor and the pages crumble', () => {
    let s = setup(['>@'], (b) => { b.player.pages = ['blink', 'ward']; });
    s = act(s, move(-1, 0), { type: 'descend' });
    expect(s.depth).toBe(2);
    expect(s.phase).toBe('play');
    expect(s.player.pages).toEqual([null, null]);
    expect(s.player.pos).toEqual(s.floor.start);
  });

  it('ring corruption follows you down', () => {
    let s = setup(['>@r'], () => {});
    s = act(s, move(1, 0), { type: 'ring' });
    s = act(s, move(-1, 0), move(-1, 0));
    if (s.phase === 'stairs') {
      s = act(s, { type: 'descend' });
      expect(s.floor.enemies.filter((e) => e.type === 'wraith')).toHaveLength(1);
    }
  });

  it('dying keeps only a share of what you carried', () => {
    const s = act(setup(['@g'], (b) => { b.player.hearts = 1; b.player.carried = 10; }), wait);
    expect(s.outcome).toEqual({ kind: 'died', carried: 10, score: Math.floor(10 * config.run.deathKeepShare) });
  });

  it('the lamp running out ends the run the same way', () => {
    const s = act(setup(['@..'], (b) => { b.player.oil = 1; b.player.carried = 10; }), wait);
    expect(s.outcome?.kind).toBe('lampOut');
    expect(s.outcome?.score).toBe(Math.floor(10 * config.run.deathKeepShare));
  });

  it('you cannot descend with an empty lamp', () => {
    const s = act(setup(['>@'], (b) => { b.player.oil = 1; }), move(-1, 0));
    expect(s.phase).toBe('stairs');
    expect(canDescend(s)).toBe(false);
    expect(step(s, { type: 'descend' }).ok).toBe(false);
  });

  it('reaching the stairs on the last floor escapes with everything', () => {
    let s = setup(['>@'], (b) => { b.depth = config.run.floors; b.player.carried = 7; });
    s = act(s, move(-1, 0));
    expect(s.outcome).toEqual({ kind: 'escaped', carried: 7, score: 7 });
  });
});

describe('determinism', () => {
  it('a new run is the same for the same seed', () => {
    expect(newRun(99)).toEqual(newRun(99));
  });

  it('replaying the actions rebuilds exactly the same run', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const { state, actions } = botRun(newRun(seed));
      expect(state.phase).toBe('over');
      const replayed = replay(seed, JSON.parse(JSON.stringify(actions)));
      expect(replayed).toEqual(state);
      expect(JSON.parse(JSON.stringify(state))).toEqual(state);
    }
  });

  it('runs always end, and the bot sometimes gets deep', () => {
    let deepest = 0;
    for (let seed = 100; seed < 300; seed++) {
      const { state } = botRun(newRun(seed));
      expect(state.phase).toBe('over');
      expect(state.turn).toBeLessThanOrEqual(config.player.oil + 200);
      deepest = Math.max(deepest, state.depth);
    }
    expect(deepest).toBeGreaterThanOrEqual(3);
  });
});

describe('move costs', () => {
  it('shows exactly what each move would cost this turn', () => {
    let s = setup(['...g...', '.......', '...@...', '.......']);
    s = act(s, wait); // goblin steps in and winds up
    const costs = moveCosts(s);
    const g = s.floor.enemies[0].pos;
    const at = (x: number, y: number) => costs.find((c) => c.pos.x === x && c.pos.y === y)?.damage;
    expect(at(s.player.pos.x, s.player.pos.y)).toBe(1); // waiting: hit
    expect(at(g.x, g.y)).toBe(0); // attacking it first: free
    expect(at(s.player.pos.x, s.player.pos.y + 1)).toBe(1); // walking away: free hit
    for (const c of costs) {
      const r = step(s, c.pos.x === s.player.pos.x && c.pos.y === s.player.pos.y
        ? { type: 'wait' } : { type: 'move', dx: c.pos.x - s.player.pos.x, dy: c.pos.y - s.player.pos.y });
      expect(r.state.player.hearts).toBe(s.player.hearts - c.damage);
    }
  });
});

