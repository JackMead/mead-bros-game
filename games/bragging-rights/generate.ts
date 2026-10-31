import { config } from './config';
import { DIRS, add, dist, distances, inBounds, same, setTile, tileAt } from './grid';
import type { FloorKit } from './kit';
import { Rng, mix } from './rng';
import type { Enemy, Floor, Item, Pos } from './types';

/**
 * Build floor `depth` of a run. Depends only on the seed, depth and kit, never on how the
 * player is doing, so everyone who plays a seed gets exactly the same dungeon.
 * Enemies start with no intent; the simulation decides intents when the floor begins.
 */
export function generateFloor(seed: number, depth: number, kit: FloorKit): Floor {
  const rng = new Rng(mix(seed, depth));
  for (let attempt = 0; attempt < config.gen.attempts; attempt++) {
    const floor = tryLayout(rng, depth, kit);
    if (floor) {
      populate(floor, rng, depth, kit);
      return floor;
    }
  }
  const open = emptyFloor(depth, { x: 3, y: config.grid.height - 1 }, { x: 3, y: 0 });
  populate(open, rng, depth, kit);
  return open;
}

function emptyFloor(depth: number, start: Pos, stairs: Pos): Floor {
  const { width, height } = config.grid;
  return {
    depth, width, height,
    tiles: new Array(width * height).fill('floor'),
    start, stairs, items: [], enemies: [],
  };
}

function tryLayout(rng: Rng, depth: number, kit: FloorKit): Floor | null {
  const { width, height } = config.grid;
  const start = { x: rng.int(1, width - 2), y: height - 1 };
  const stairs = { x: rng.int(0, width - 1), y: rng.int(0, 1) };
  const f = emptyFloor(depth, start, stairs);
  const reserved = (p: Pos) => dist(p, start) <= 1 || same(p, stairs);
  const total = width * height;

  const scatter = (count: number, tile: 'wall' | 'chasm', clusterChance: number) => {
    for (let i = 0; i < count; i++) {
      const p = { x: rng.int(0, width - 1), y: rng.int(0, height - 1) };
      if (reserved(p)) continue;
      setTile(f, p, tile);
      if (rng.chance(clusterChance)) {
        const n = add(p, DIRS[rng.int(0, 3) * 2]);
        if (inBounds(f, n) && !reserved(n)) setTile(f, n, tile);
      }
    }
  };
  scatter(Math.round(total * kit.wallDensity * 0.6), 'wall', 0.6);
  scatter(Math.round(total * (kit.chasmDensity + kit.chasmPerDepth * depth)), 'chasm', 0.4);

  const reach = distances(f, start, (p) => tileAt(f, p) === 'floor');
  if (reach[stairs.y * width + stairs.x] < 0) return null;

  // Wall off unreachable pockets so every open square is somewhere you can go.
  let reachable = 0;
  for (let i = 0; i < total; i++) {
    if (f.tiles[i] !== 'floor') continue;
    if (reach[i] < 0) f.tiles[i] = 'wall';
    else reachable++;
  }
  if (reachable < total * config.gen.minReachableShare) return null;
  return f;
}

function populate(f: Floor, rng: Rng, depth: number, kit: FloorKit): void {
  const cells: Pos[] = [];
  for (let y = 0; y < f.height; y++) {
    for (let x = 0; x < f.width; x++) {
      const p = { x, y };
      if (tileAt(f, p) === 'floor' && !same(p, f.start) && !same(p, f.stairs)) cells.push(p);
    }
  }
  rng.shuffle(cells);
  const taken = new Set<string>();
  const take = (ok: (p: Pos) => boolean): Pos | null => {
    const p = cells.find((c) => !taken.has(`${c.x},${c.y}`) && ok(c));
    if (!p) return null;
    taken.add(`${p.x},${p.y}`);
    return p;
  };

  // Enemies, spending a difficulty budget that grows with depth.
  let budget = config.gen.budget.base + config.gen.budget.perDepth * depth;
  let id = 1;
  while (budget > 0 && f.enemies.length < config.gen.maxEnemies) {
    const options = kit.enemies.filter((e) => e.minDepth <= depth && e.cost <= budget + 0.5);
    if (options.length === 0) break;
    const totalWeight = options.reduce((s, e) => s + e.weight, 0);
    let roll = rng.int(0, totalWeight - 1);
    const type = options.find((e) => (roll -= e.weight) < 0) ?? options[0];
    const pos = take((p) => dist(p, f.start) >= config.gen.safeRadius);
    if (!pos) break;
    const enemy: Enemy = { id: id++, type: type.id, pos, hp: type.hp, intent: { type: 'none' }, tick: 0 };
    f.enemies.push(enemy);
    budget -= type.cost;
  }

  const place = (item: Omit<Item, 'pos'>, minDist = 1) => {
    const pos = take((p) => dist(p, f.start) >= minDist);
    if (pos) f.items.push({ ...item, pos });
  };

  if (depth === 1) place({ kind: 'ring', value: 0 }, 2);

  const relics = config.gen.relics.base + Math.floor(depth * config.gen.relics.perDepth);
  for (let i = 0; i < relics; i++) {
    place({ kind: 'relic', value: rng.int(1 + Math.floor(depth / 2), 2 + depth) });
  }
  if (rng.chance(config.gen.oil.chance)) place({ kind: 'oil', value: config.gen.oil.value });
  if (rng.chance(config.gen.pages.chance)) place({ kind: 'page', value: 0, page: rng.pick(kit.pages) });
  if (rng.chance(config.gen.pages.extraChance)) place({ kind: 'page', value: 0, page: rng.pick(kit.pages) });
}
